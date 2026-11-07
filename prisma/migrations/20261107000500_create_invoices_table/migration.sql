-- CreateTable
CREATE TABLE `invoices` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `seller_id` BIGINT UNSIGNED NOT NULL,
    `customer_id` BIGINT UNSIGNED NOT NULL,
    `invoice_date` TIMESTAMP(0) NULL,
    `total_price` BIGINT UNSIGNED NOT NULL DEFAULT 0,
    `paid` BOOLEAN NOT NULL DEFAULT false,
    `pay_link` VARCHAR(255) NULL,
    `link_views` INTEGER UNSIGNED NOT NULL DEFAULT 0,
    `paid_at` TIMESTAMP(0) NULL,
    `created_at` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` TIMESTAMP(0) NULL,

    UNIQUE INDEX `invoices_pay_link_unique`(`pay_link`),
    INDEX `invoices_seller_id_foreign`(`seller_id`),
    INDEX `invoices_customer_id_foreign`(`customer_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `invoices` ADD CONSTRAINT `invoices_seller_id_foreign` FOREIGN KEY (`seller_id`) REFERENCES `sellers`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `invoices` ADD CONSTRAINT `invoices_customer_id_foreign` FOREIGN KEY (`customer_id`) REFERENCES `customers`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
