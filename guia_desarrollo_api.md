# Guía de Desarrollo - API REST con Entidad Box

## 1. Definición del Modelo de Dominio
El primer paso es definir la entidad de dominio que representa una caja en el sistema. Esta entidad incluye todas las propiedades necesarias para representar una caja física y sus características. 

```csharp
// Models/Box.cs
using System.ComponentModel.DataAnnotations;

namespace StockAvaibleTest_API.Models
{
    public class Box
    {
        public int Id { get; set; }

        [Required]
        [StringLength(50)]
        public string Code { get; set; } = string.Empty;

        [Required]
        [StringLength(255)]
        public string Location { get; set; } = string.Empty;

        public int TotalCapacity { get; set; }

        public bool IsActive { get; set; } = true;

        public DateTime? LastTransactionDate { get; set; }

        // Propiedades de navegación
        public virtual ICollection<BoxProductTransaction> Transactions { get; set; } = new List<BoxProductTransaction>();
    }
}
```

## 2. Configuración del DbContext
Configuramos el contexto de base de datos para manejar la entidad Box y sus relaciones. Es importante definir índices únicos para garantizar la integridad de los datos.

```csharp
// Data/ApplicationDbContext.cs
public class ApplicationDbContext : DbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options) { }

    public DbSet<Box> Boxes { get; set; }
    
    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Box>()
            .HasIndex(b => b.Code)
            .IsUnique();
    }
}
```

## 3. Definición de DTOs
Los DTOs (Data Transfer Objects) son esenciales para controlar qué datos se exponen a través de la API. Cada DTO tiene un propósito específico:

```csharp
// DTOs/BoxDTOs.cs
namespace StockAvaibleTest_API.DTOs
{
    // DTO básico para mostrar información de una caja
    public class BoxDTO
    {
        public int Id { get; set; }
        public string Code { get; set; } = string.Empty;
        public string Location { get; set; } = string.Empty;
        public int TotalCapacity { get; set; }
        public bool IsActive { get; set; }
        public DateTime? LastTransactionDate { get; set; }
    }

    // DTO detallado que incluye productos asociados
    public class BoxDetailDTO : BoxDTO
    {
        public int UsedCapacity { get; set; }
        public int AvailableCapacity { get; set; }
        public List<BoxProductDTO> Products { get; set; } = new List<BoxProductDTO>();
    }

    // DTO para crear una nueva caja
    public class CreateBoxDTO
    {
        public string Code { get; set; } = string.Empty;
        public string Location { get; set; } = string.Empty;
        public int TotalCapacity { get; set; }
    }

    // DTO para actualizar una caja existente
    public class UpdateBoxDTO
    {
        public string Location { get; set; } = string.Empty;
        public int? TotalCapacity { get; set; }
        public bool? IsActive { get; set; }
    }

    // DTO para mostrar productos en una caja
    public class BoxProductDTO
    {
        public int ProductId { get; set; }
        public string ProductCode { get; set; } = string.Empty;
        public string ProductDescription { get; set; } = string.Empty;
        public int Quantity { get; set; }
    }
}
```

## 4. Configuración de AutoMapper
AutoMapper facilita la conversión entre entidades y DTOs, manteniendo el código limpio y reduciendo la duplicación.

```csharp
// Mappings/MappingProfile.cs
using AutoMapper;
using StockAvaibleTest_API.DTOs;
using StockAvaibleTest_API.Models;

namespace StockAvaibleTest_API.Mappings
{
    public class MappingProfile : Profile
    {
        public MappingProfile()
        {
            // Mapeo base de Box a BoxDTO
            CreateMap<Box, BoxDTO>();
            
            // Mapeo detallado incluyendo productos
            CreateMap<Box, BoxDetailDTO>();
            
            // Mapeo para crear nuevas cajas
            CreateMap<CreateBoxDTO, Box>();
            
            // Mapeo para actualizar cajas existentes
            CreateMap<UpdateBoxDTO, Box>()
                .ForAllMembers(opts => opts.Condition((src, dest, srcMember) => srcMember != null));
        }
    }
}
```

## 5. Creación de Validadores
Los validadores son cruciales para garantizar que los datos de entrada cumplan con las reglas de negocio antes de llegar a la base de datos.

```csharp
// Validators/BoxValidators.cs
using FluentValidation;
using StockAvaibleTest_API.DTOs;
using StockAvaibleTest_API.Repositories;

namespace StockAvaibleTest_API.Validators
{
    // Validador para creación de cajas
    public class BoxValidator : AbstractValidator<CreateBoxDTO>
    {
        public BoxValidator(IBoxRepository boxRepository)
        {
            // Validación del código de la caja
            RuleFor(x => x.Code)
                .NotEmpty().WithMessage("El código es requerido")
                .MaximumLength(50).WithMessage("El código no puede exceder los 50 caracteres")
                .MustAsync(async (code, cancellation) => 
                    !await boxRepository.ExistsByCodeAsync(code))
                .WithMessage("Ya existe una caja con este código");

            // Validación de la ubicación
            RuleFor(x => x.Location)
                .NotEmpty().WithMessage("La ubicación es requerida")
                .MaximumLength(255).WithMessage("La ubicación no puede exceder los 255 caracteres");

            // Validación de la capacidad
            RuleFor(x => x.TotalCapacity)
                .GreaterThan(0).WithMessage("La capacidad total debe ser mayor a 0");
        }
    }

    // Validador para actualización de cajas
    public class UpdateBoxValidator : AbstractValidator<UpdateBoxDTO>
    {
        public UpdateBoxValidator()
        {
            // Validación de la ubicación
            RuleFor(x => x.Location)
                .NotEmpty().WithMessage("La ubicación es requerida")
                .MaximumLength(255).WithMessage("La ubicación no puede exceder los 255 caracteres");

            // Validación condicional de la capacidad
            When(x => x.TotalCapacity.HasValue, () => {
                RuleFor(x => x.TotalCapacity)
                    .GreaterThan(0).WithMessage("La capacidad total debe ser mayor a 0");
            });
        }
    }
}
```

## 6. Definición de Interfaces del Repositorio
Las interfaces definen los contratos que los repositorios deben implementar. Es importante especificar claramente qué operaciones se pueden realizar con los datos.

```csharp
// Repositories/Interfaces/IBoxRepository.cs
using StockAvaibleTest_API.Models;

namespace StockAvaibleTest_API.Repositories
{
    public interface IBoxRepository
    {
        // Obtener todas las cajas
        Task<IEnumerable<Box>> GetAllAsync();
        
        // Obtener una caja específica con sus productos
        Task<Box?> GetByIdWithProductsAsync(int id);
        
        // Verificar si existe una caja con un código específico
        Task<bool> ExistsByCodeAsync(string code);
        
        // Operaciones CRUD básicas
        void Add(Box box);
        void Update(Box box);
        void Delete(Box box);
        
        // Obtener la cantidad de un producto en una caja
        Task<int> GetProductQuantityAsync(int boxId, int productId);
        
        // Obtener transacciones de un producto en una caja
        Task<IEnumerable<BoxProductTransaction>> GetBoxProductTransactionsAsync(int boxId, int productId);
    }
}
```

## 7. Implementación del Repositorio
La implementación del repositorio maneja el acceso a la base de datos y la lógica de persistencia de datos.

```csharp
// Repositories/BoxRepository.cs
using Microsoft.EntityFrameworkCore;
using StockAvaibleTest_API.Data;
using StockAvaibleTest_API.Models;

namespace StockAvaibleTest_API.Repositories
{
    public class BoxRepository : IBoxRepository
    {
        private readonly ApplicationDbContext _context;

        public BoxRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        // Obtener todas las cajas
        public async Task<IEnumerable<Box>> GetAllAsync()
        {
            return await _context.Boxes.ToListAsync();
        }

        // Obtener una caja con sus productos
        public async Task<Box?> GetByIdWithProductsAsync(int id)
        {
            return await _context.Boxes
                .Include(b => b.Transactions)
                .ThenInclude(t => t.Product)
                .FirstOrDefaultAsync(b => b.Id == id);
        }

        // Calcular la cantidad disponible de un producto
        public async Task<int> GetProductQuantityAsync(int boxId, int productId)
        {
            var transactions = await GetBoxProductTransactionsAsync(boxId, productId);
            
            int inQuantity = transactions
                .Where(t => t.TransactionType == "IN")
                .Sum(t => t.Quantity);
                
            int outQuantity = transactions
                .Where(t => t.TransactionType == "OUT")
                .Sum(t => t.Quantity);
                
            return inQuantity - outQuantity;
        }

        // Guardar cambios en la base de datos
        public async Task SaveChangesAsync()
        {
            await _context.SaveChangesAsync();
        }
    }
}
```

## 8. Definición de Interfaces del Servicio
Las interfaces de servicio definen la lógica de negocio que se implementará. Es importante mantener los servicios desacoplados de la implementación específica.

```csharp
// Services/Interfaces/IBoxService.cs
using StockAvaibleTest_API.Common;
using StockAvaibleTest_API.DTOs;

namespace StockAvaibleTest_API.Services
{
    public interface IBoxService
    {
        // Obtener todas las cajas
        Task<Result<IEnumerable<BoxDTO>>> GetAllBoxesAsync();
        
        // Obtener detalles de una caja específica
        Task<Result<BoxDetailDTO>> GetBoxByIdAsync(int id);
        
        // Crear una nueva caja
        Task<Result<BoxDTO>> CreateBoxAsync(CreateBoxDTO boxDto);
        
        // Actualizar una caja existente
        Task<Result<BoxDTO>> UpdateBoxAsync(int id, UpdateBoxDTO boxDto);
        
        // Eliminar una caja
        Task<Result<bool>> DeleteBoxAsync(int id);
        
        // Obtener cantidad de producto en caja
        Task<Result<int>> GetProductQuantityInBoxAsync(int boxId, int productId);
    }
}
```

## 9. Implementación del Servicio
La implementación del servicio contiene toda la lógica de negocio y manejo de errores.

```csharp
// Services/BoxService.cs
using AutoMapper;
using StockAvaibleTest_API.Common;
using StockAvaibleTest_API.DTOs;
using StockAvaibleTest_API.Models;
using StockAvaibleTest_API.Repositories;

namespace StockAvaibleTest_API.Services
{
    public class BoxService : IBoxService
    {
        private readonly IBoxRepository _boxRepository;
        private readonly IMapper _mapper;

        public BoxService(IBoxRepository boxRepository, IMapper mapper)
        {
            _boxRepository = boxRepository;
            _mapper = mapper;
        }

        // Obtener todas las cajas
        public async Task<Result<IEnumerable<BoxDTO>>> GetAllBoxesAsync()
        {
            try
            {
                var boxes = await _boxRepository.GetAllAsync();
                var boxDtos = _mapper.Map<IEnumerable<BoxDTO>>(boxes);
                return Result<IEnumerable<BoxDTO>>.Success(boxDtos);
            }
            catch (Exception ex)
            {
                return Result<IEnumerable<BoxDTO>>.Failure($"Error al obtener las cajas: {ex.Message}");
            }
        }

        // Obtener detalles de una caja
        public async Task<Result<BoxDetailDTO>> GetBoxByIdAsync(int id)
        {
            try
            {
                var box = await _boxRepository.GetByIdWithProductsAsync(id);
                if (box == null)
                    return Result<BoxDetailDTO>.Failure($"No se encontró la caja con ID {id}");

                var boxDto = _mapper.Map<BoxDetailDTO>(box);
                
                // Calcular productos actuales en la caja
                var productGroups = box.Transactions
                    .GroupBy(t => t.ProductId)
                    .Select(g => new {
                        ProductId = g.Key,
                        Product = g.First().Product,
                        Quantity = g.Where(t => t.TransactionType == "IN").Sum(t => t.Quantity) - 
                                  g.Where(t => t.TransactionType == "OUT").Sum(t => t.Quantity)
                    })
                    .Where(p => p.Quantity > 0);

                boxDto.Products = productGroups.Select(g => new BoxProductDTO
                {
                    ProductId = g.ProductId,
                    ProductCode = g.Product.Code,
                    ProductDescription = g.Product.Description,
                    Quantity = g.Quantity
                });

                return Result<BoxDetailDTO>.Success(boxDto);
            }
            catch (Exception ex)
            {
                return Result<BoxDetailDTO>.Failure($"Error al obtener la caja: {ex.Message}");
            }
        }
    }
}
```

## 10. Implementación del Controlador
Los controladores expone los endpoints de la API y manejan las solicitudes HTTP.

```csharp
// Controllers/BoxesController.cs
using Microsoft.AspNetCore.Mvc;
using StockAvaibleTest_API.DTOs;
using StockAvaibleTest_API.Services;

namespace StockAvaibleTest_API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class BoxesController : ControllerBase
    {
        private readonly IBoxService _boxService;

        public BoxesController(IBoxService boxService)
        {
            _boxService = boxService;
        }

        // GET: Obtener todas las cajas
        [HttpGet]
        public async Task<IActionResult> GetBoxes()
        {
            var result = await _boxService.GetAllBoxesAsync();
            if (!result.IsSuccess)
                return StatusCode(500, result.Error);

            return Ok(result.Data);
        }

        // GET: Obtener una caja específica
        [HttpGet("{id}")]
        public async Task<IActionResult> GetBox(int id)
        {
            var result = await _boxService.GetBoxByIdAsync(id);
            if (!result.IsSuccess)
                return NotFound(result.Error);

            return Ok(result.Data);
        }

        // POST: Crear una nueva caja
        [HttpPost]
        public async Task<IActionResult> CreateBox(CreateBoxDTO boxDto)
        {
            var result = await _boxService.CreateBoxAsync(boxDto);
            if (!result.IsSuccess)
                return BadRequest(result.Error);

            return CreatedAtAction(nameof(GetBox), new { id = result.Data!.Id }, result.Data);
        }

        // PUT: Actualizar una caja existente
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateBox(int id, UpdateBoxDTO boxDto)
        {
            var result = await _boxService.UpdateBoxAsync(id, boxDto);
            if (!result.IsSuccess)
                return NotFound(result.Error);

            return Ok(result.Data);
        }

        // DELETE: Eliminar una caja
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteBox(int id)
        {
            var result = await _boxService.DeleteBoxAsync(id);
            if (!result.IsSuccess)
                return BadRequest(result.Error);

            return NoContent();
        }
    }
}
```

## 11. Configuración de Dependencias
Configuración del contenedor de dependencias en Program.cs:

```csharp
// Program.cs (fragmento)
// Registrar repositorios
builder.Services.AddScoped<IBoxRepository, BoxRepository>();

// Registrar servicios
builder.Services.AddScoped<IBoxService, BoxService>();

// Registrar Unit of Work
builder.Services.AddScoped<IUnitOfWork, UnitOfWork>();

// Configurar AutoMapper
builder.Services.AddAutoMapper(typeof(MappingProfile));

// Configurar FluentValidation
builder.Services.AddValidatorsFromAssemblyContaining<BoxValidator>();
```

## Resumen del Flujo de Datos

1. **Solicitud HTTP** → El cliente envía una solicitud HTTP a un endpoint
2. **Controller** → Recibe la solicitud, valida los datos de entrada y llama al servicio apropiado
3. **Service** → Implementa la lógica de negocio, llama a los repositorios necesarios
4. **Repository** → Accede a la base de datos y realiza operaciones CRUD
5. **Entity Framework** → Traduce las operaciones del repositorio en consultas SQL
6. **Base de Datos** → Almacena y recupera los datos
7. **Respuesta** → Los datos se mapean a DTOs y se devuelven al cliente

## Puntos Clave del Diseño

1. **Separación de Responsabilidades**:
   - Cada componente tiene una responsabilidad clara
   - Facilita el mantenimiento y las pruebas
   - Mejora la reutilización del código

2. **Validación en Múltiples Niveles**:
   - Validación inicial en el controller
   - Validación de negocio en el service
   - Validación de datos en el repository
   - Prevención de inyección SQL en la base de datos

3. **Manejo de Errores Consistente**:
   - Uso de la clase Result<T> para respuestas consistentes
   - Manejo de excepciones en todos los niveles
   - Mensajes de error descriptivos
   - Logging de errores importantes

4. **Optimización de Consultas**:
   - Eager loading para relaciones necesarias
   - Lazy loading para datos opcionales
   - Caching para datos frecuentemente accedidos
   - Índices en campos de búsqueda comunes

Esta guía proporciona un ejemplo completo de cómo implementar una API REST en .NET usando el patrón de arquitectura en capas, con una implementación completa de la entidad Box y todas sus operaciones relacionadas.
