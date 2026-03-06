-- CreateTable
CREATE TABLE `products` (
    `id` VARCHAR(36) NOT NULL,
    `name` VARCHAR(255) NOT NULL,
    `description` TEXT NOT NULL,
    `type` ENUM('COUPON') NOT NULL DEFAULT 'COUPON',
    `image_url` VARCHAR(2048) NOT NULL,
    `cost_price` DECIMAL(10, 2) NOT NULL,
    `margin_percentage` DECIMAL(10, 2) NOT NULL,
    `is_sold` BOOLEAN NOT NULL DEFAULT false,
    `value_type` ENUM('STRING', 'IMAGE') NOT NULL DEFAULT 'STRING',
    `value` TEXT NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
