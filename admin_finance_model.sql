CREATE SCHEMA IF NOT EXISTS admin_finance;

 CREATE TABLE admin_finance.`user` (
  `id` int NOT NULL AUTO_INCREMENT,
  `mail` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `d_type` varchar(255) NOT NULL,
  `d_number` int NOT NULL,
  `password` varchar(255) NOT NULL,
  `suscription_state` datetime NOT NULL,
  `first_time` tinyint(1) NOT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4;

CREATE TABLE admin_finance.`business` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `CUIT` varchar(255) NOT NULL,
  `income` float NOT NULL,
  `userId` int NOT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `userId` (`userId`),
  CONSTRAINT `business_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE admin_finance.`product` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

 CREATE TABLE admin_finance.`business_product` (
  `businessid` int NOT NULL,
  `productid` int NOT NULL,
  `stock` int NOT NULL,
  `sold` int NOT NULL,
  `profit` double NOT NULL,
  `price` double NOT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`businessid`,`productid`),
  UNIQUE KEY `business_product_ProductId_BusinessId_unique` (`productid`,`businessid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE admin_finance.`sale` (
  `value` float NOT NULL,
  `ticketName` varchar(255) NOT NULL,
  `ticketType` int NOT NULL,
  `saleId` int NOT NULL AUTO_INCREMENT,
  `time` datetime NOT NULL,
  `businessId` int NOT NULL,
  PRIMARY KEY (`saleId`,`time`),
  UNIQUE KEY `unique_time` (`time`),
  KEY `businessId` (`businessId`),
  CONSTRAINT `sale_ibfk_1` FOREIGN KEY (`businessId`) REFERENCES `business` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=55 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE admin_finance.`sale_product` (
  `saleBusiness` int NOT NULL,
  `productid` int NOT NULL,
  `sold` int NOT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `saleId` int NOT NULL,
  PRIMARY KEY (`saleId`,`saleBusiness`,`productid`),
  KEY `sale_product_ibfk_2` (`saleBusiness`),
  KEY `sale_product_ibfk_3` (`productid`),
  CONSTRAINT `sale_product_ibfk_1` FOREIGN KEY (`saleId`) REFERENCES `sale` (`saleId`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `sale_product_ibfk_2` FOREIGN KEY (`saleBusiness`) REFERENCES `business` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `sale_product_ibfk_3` FOREIGN KEY (`productid`) REFERENCES `product` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE admin_finance.`ticket` (
  `id` int NOT NULL AUTO_INCREMENT,
  `sId` int NOT NULL,
  `name` varchar(255) NOT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;