<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Stock Available</title>
    <link href="public/css/bootstrap.min.css" rel="stylesheet">
    <link href="public/css/custom/styles.css" rel="stylesheet">
</head>
<body>
    <!-- Menú de navegación -->
    <nav class="navbar navbar-expand-lg navbar-dark bg-dark">
        <div class="container">
            <a class="navbar-brand" href="#">Stock Available</a>
            <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
                <span class="navbar-toggler-icon"></span>
            </button>
            <div class="collapse navbar-collapse" id="navbarNav">
                <ul class="navbar-nav">
                    <li class="nav-item">
                        <a class="nav-link" href="?view=transactions">Transactions</a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link" href="?view=products">Products</a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link" href="?view=boxes">Boxes</a>
                    </li>
                </ul>
            </div>
        </div>
    </nav>

    <!-- Contenedor principal -->
    <div class="container mt-4">
        <?php include "app/views/{$view}.php"; ?>
    </div>    <!-- Scripts en el orden correcto -->
    <script src="public/js/jquery-3.7.1.min.js"></script>
    <script src="public/js/bootstrap.bundle.min.js"></script>
    <!-- Variables globales -->
    <script>
        const API_URL = '<?php echo API_URL; ?>';
        const BASE_URL = '<?php echo BASE_URL; ?>';
    </script>
    <!-- Scripts personalizados después de las dependencias -->
    <script src="public/js/custom/main.js"></script>
    <?php if (isset($view)): ?>
    <script src="public/js/custom/<?php echo $view; ?>.js"></script>
    <?php endif; ?>
</body>
</html>
