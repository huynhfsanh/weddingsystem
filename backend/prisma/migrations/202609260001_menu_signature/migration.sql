-- AlterTable
ALTER TABLE `wedding_contracts` ADD COLUMN `menu_combo_id` VARCHAR(191) NULL;

-- CreateTable
CREATE TABLE `menu_combos` (
    `id` VARCHAR(191) NOT NULL,
    `code` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `group_name` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `price_per_table` DECIMAL(14, 2) NOT NULL DEFAULT 0,
    `sort_order` INTEGER NOT NULL DEFAULT 0,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `menu_combos_code_key`(`code`),
    INDEX `menu_combos_is_active_sort_order_idx`(`is_active`, `sort_order`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `menu_dishes` (
    `id` VARCHAR(191) NOT NULL,
    `combo_id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `reference_url` VARCHAR(500) NULL,
    `description` VARCHAR(191) NULL,
    `sort_order` INTEGER NOT NULL DEFAULT 0,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `menu_dishes_combo_id_is_active_sort_order_idx`(`combo_id`, `is_active`, `sort_order`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `contract_menu_items` (
    `id` VARCHAR(191) NOT NULL,
    `contract_id` VARCHAR(191) NOT NULL,
    `source_dish_id` VARCHAR(191) NULL,
    `original_dish_name` VARCHAR(191) NOT NULL,
    `selected_dish_name` VARCHAR(191) NOT NULL,
    `reference_url` VARCHAR(500) NULL,
    `is_replacement` BOOLEAN NOT NULL DEFAULT false,
    `sort_order` INTEGER NOT NULL DEFAULT 0,

    INDEX `contract_menu_items_contract_id_sort_order_idx`(`contract_id`, `sort_order`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `contract_signatures` (
    `id` VARCHAR(191) NOT NULL,
    `contract_id` VARCHAR(191) NOT NULL,
    `signer_id` VARCHAR(191) NOT NULL,
    `signer_name` VARCHAR(191) NOT NULL,
    `signature_url` VARCHAR(500) NOT NULL,
    `document_hash` VARCHAR(64) NOT NULL,
    `consent_version` VARCHAR(191) NOT NULL DEFAULT 'green-wedding-contract-v1',
    `ip_address` VARCHAR(191) NULL,
    `user_agent` TEXT NULL,
    `signed_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `contract_signatures_contract_id_key`(`contract_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `wedding_contracts` ADD CONSTRAINT `wedding_contracts_menu_combo_id_fkey` FOREIGN KEY (`menu_combo_id`) REFERENCES `menu_combos`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `menu_dishes` ADD CONSTRAINT `menu_dishes_combo_id_fkey` FOREIGN KEY (`combo_id`) REFERENCES `menu_combos`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `contract_menu_items` ADD CONSTRAINT `contract_menu_items_contract_id_fkey` FOREIGN KEY (`contract_id`) REFERENCES `wedding_contracts`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `contract_menu_items` ADD CONSTRAINT `contract_menu_items_source_dish_id_fkey` FOREIGN KEY (`source_dish_id`) REFERENCES `menu_dishes`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `contract_signatures` ADD CONSTRAINT `contract_signatures_contract_id_fkey` FOREIGN KEY (`contract_id`) REFERENCES `wedding_contracts`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `contract_signatures` ADD CONSTRAINT `contract_signatures_signer_id_fkey` FOREIGN KEY (`signer_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
