-- 1. Create Database
CREATE DATABASE StockAvailableDB;

-- 2. Use the created database
USE StockAvailableDB;

-- 3. Table: Categories
CREATE TABLE Categories (
    Id INT IDENTITY PRIMARY KEY,
    Code NVARCHAR(50) NOT NULL UNIQUE,
    Name NVARCHAR(100) NOT NULL,
    Description NVARCHAR(255),
    IsActive BIT NOT NULL DEFAULT 1 -- 1 = Active, 0 = Inactive
);

-- 4. Table: Products
CREATE TABLE Products (
    Id INT IDENTITY PRIMARY KEY,
    Code NVARCHAR(50) NOT NULL UNIQUE,
    Description NVARCHAR(255) NOT NULL,
    MinimumStock INT NOT NULL DEFAULT 0,
    Unit NVARCHAR(50) NOT NULL,
    IsActive BIT NOT NULL DEFAULT 1,
    CategoryId INT NOT NULL,
    LastTransactionDate DATETIME NULL,

    FOREIGN KEY (CategoryId) REFERENCES Categories(Id)
);

-- 5. Table: Boxes
CREATE TABLE Boxes (
    Id INT IDENTITY PRIMARY KEY,
    Code NVARCHAR(50) NOT NULL UNIQUE,
    Location NVARCHAR(255) NOT NULL,
    LastOperationDate DATETIME NULL
);

-- 6. Table: Box-Product Transactions
CREATE TABLE BoxProductTransactions (
    Id INT IDENTITY PRIMARY KEY,
    BoxId INT NOT NULL,
    ProductId INT NOT NULL,
    Quantity INT NOT NULL CHECK (Quantity > 0),
    Type NVARCHAR(10) NOT NULL CHECK (Type IN ('IN', 'OUT')),
    TransactionDate DATETIME NOT NULL DEFAULT GETDATE(),

    FOREIGN KEY (BoxId) REFERENCES Boxes(Id),
    FOREIGN KEY (ProductId) REFERENCES Products(Id)
);
