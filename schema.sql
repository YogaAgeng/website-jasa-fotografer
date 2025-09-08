-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Waktu pembuatan: 03 Sep 2025 pada 19.06
-- Versi server: 10.4.32-MariaDB
-- Versi PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `schema`
--

-- --------------------------------------------------------

--
-- Struktur dari tabel `add_ons`
--

CREATE TABLE `add_ons` (
  `id` char(36) NOT NULL,
  `name` varchar(120) NOT NULL,
  `price` int(11) NOT NULL,
  `requires_crew` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updated_at` datetime(3) NOT NULL DEFAULT current_timestamp(3) ON UPDATE current_timestamp(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `add_ons`
--

INSERT INTO `add_ons` (`id`, `name`, `price`, `requires_crew`, `created_at`, `updated_at`) VALUES
('22000000-0000-0000-0000-000000000001', 'Extra 1 Jam', 250000, 0, '2025-09-03 23:39:57.587', '2025-09-03 23:39:57.587'),
('22000000-0000-0000-0000-000000000002', 'Retouch Premium (per 10 foto)', 150000, 0, '2025-09-03 23:39:57.587', '2025-09-03 23:39:57.587');

-- --------------------------------------------------------

--
-- Struktur dari tabel `assignments`
--

CREATE TABLE `assignments` (
  `id` char(36) NOT NULL,
  `booking_id` char(36) NOT NULL,
  `staff_id` char(36) NOT NULL,
  `role` enum('MAIN','ASSISTANT','EDITOR') NOT NULL DEFAULT 'MAIN'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `assignments`
--

INSERT INTO `assignments` (`id`, `booking_id`, `staff_id`, `role`) VALUES
('31000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 'MAIN');

-- --------------------------------------------------------

--
-- Struktur dari tabel `bookings`
--

CREATE TABLE `bookings` (
  `id` char(36) NOT NULL,
  `client_id` char(36) NOT NULL,
  `package_id` char(36) NOT NULL,
  `event_date` date NOT NULL,
  `start_at` datetime(3) NOT NULL,
  `end_at` datetime(3) NOT NULL,
  `address` varchar(255) DEFAULT NULL,
  `location_latlon` varchar(60) DEFAULT NULL,
  `status` enum('INQUIRY','HOLD','CONFIRMED','SCHEDULED','IN_PROGRESS','EDITING','REVIEW','DELIVERED','CLOSED','CANCELLED','EXPIRED') NOT NULL DEFAULT 'INQUIRY',
  `subtotal` int(11) NOT NULL DEFAULT 0,
  `discount` int(11) NOT NULL DEFAULT 0,
  `total` int(11) NOT NULL DEFAULT 0,
  `dp_amount` int(11) NOT NULL DEFAULT 0,
  `dp_paid_at` datetime(3) DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updated_at` datetime(3) NOT NULL DEFAULT current_timestamp(3) ON UPDATE current_timestamp(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `bookings`
--

INSERT INTO `bookings` (`id`, `client_id`, `package_id`, `event_date`, `start_at`, `end_at`, `address`, `location_latlon`, `status`, `subtotal`, `discount`, `total`, `dp_amount`, `dp_paid_at`, `created_at`, `updated_at`) VALUES
('30000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000003', '21000000-0000-0000-0000-000000000001', '2025-09-20', '2025-09-20 02:00:00.000', '2025-09-20 04:00:00.000', 'Studio A, Jakarta', NULL, 'INQUIRY', 750000, 0, 750000, 150000, NULL, '2025-09-03 23:40:11.890', '2025-09-03 23:40:11.890');

-- --------------------------------------------------------

--
-- Struktur dari tabel `booking_items`
--

CREATE TABLE `booking_items` (
  `id` char(36) NOT NULL,
  `booking_id` char(36) NOT NULL,
  `add_on_id` char(36) NOT NULL,
  `qty` int(11) NOT NULL DEFAULT 1,
  `price` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Struktur dari tabel `delivery_assets`
--

CREATE TABLE `delivery_assets` (
  `id` char(36) NOT NULL,
  `booking_id` char(36) NOT NULL,
  `type` enum('DRIVE','GALLERY','ZIP') NOT NULL,
  `url` varchar(500) NOT NULL,
  `published_at` datetime(3) DEFAULT NULL,
  `expires_at` datetime(3) DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Struktur dari tabel `leads`
--

CREATE TABLE `leads` (
  `id` char(36) NOT NULL,
  `client_id` char(36) DEFAULT NULL,
  `source` varchar(60) DEFAULT NULL,
  `message` text DEFAULT NULL,
  `status` enum('NEW','CONTACTED','WON','LOST') DEFAULT 'NEW',
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updated_at` datetime(3) NOT NULL DEFAULT current_timestamp(3) ON UPDATE current_timestamp(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Struktur dari tabel `packages`
--

CREATE TABLE `packages` (
  `id` char(36) NOT NULL,
  `service_id` char(36) NOT NULL,
  `name` varchar(120) NOT NULL,
  `duration_min` int(11) NOT NULL,
  `base_price` int(11) NOT NULL,
  `output_quota` int(11) DEFAULT NULL,
  `includes` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`includes`)),
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updated_at` datetime(3) NOT NULL DEFAULT current_timestamp(3) ON UPDATE current_timestamp(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `packages`
--

INSERT INTO `packages` (`id`, `service_id`, `name`, `duration_min`, `base_price`, `output_quota`, `includes`, `created_at`, `updated_at`) VALUES
('21000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', 'Basic 2 Jam', 120, 750000, 20, NULL, '2025-09-03 23:39:46.781', '2025-09-03 23:39:46.781'),
('21000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000002', 'Event 4 Jam', 240, 1500000, 60, NULL, '2025-09-03 23:39:46.781', '2025-09-03 23:39:46.781');

-- --------------------------------------------------------

--
-- Struktur dari tabel `payments`
--

CREATE TABLE `payments` (
  `id` char(36) NOT NULL,
  `booking_id` char(36) NOT NULL,
  `method` enum('EWALLET','VA','CASH','BANK_TRANSFER') NOT NULL,
  `amount` int(11) NOT NULL,
  `paid_at` datetime(3) NOT NULL,
  `ref` varchar(120) DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Struktur dari tabel `services`
--

CREATE TABLE `services` (
  `id` char(36) NOT NULL,
  `name` varchar(120) NOT NULL,
  `base_duration_min` int(11) NOT NULL,
  `min_buffer_min` int(11) NOT NULL DEFAULT 15,
  `includes` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`includes`)),
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updated_at` datetime(3) NOT NULL DEFAULT current_timestamp(3) ON UPDATE current_timestamp(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `services`
--

INSERT INTO `services` (`id`, `name`, `base_duration_min`, `min_buffer_min`, `includes`, `created_at`, `updated_at`) VALUES
('20000000-0000-0000-0000-000000000001', 'Portrait', 120, 15, NULL, '2025-09-03 23:39:35.433', '2025-09-03 23:39:35.433'),
('20000000-0000-0000-0000-000000000002', 'Event', 240, 30, NULL, '2025-09-03 23:39:35.433', '2025-09-03 23:39:35.433');

-- --------------------------------------------------------

--
-- Struktur dari tabel `staff`
--

CREATE TABLE `staff` (
  `id` char(36) NOT NULL,
  `staff_type` enum('PHOTOGRAPHER','EDITOR') NOT NULL,
  `name` varchar(120) NOT NULL,
  `phone` varchar(50) DEFAULT NULL,
  `email` varchar(190) DEFAULT NULL,
  `home_base` varchar(120) DEFAULT NULL,
  `active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updated_at` datetime(3) NOT NULL DEFAULT current_timestamp(3) ON UPDATE current_timestamp(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `staff`
--

INSERT INTO `staff` (`id`, `staff_type`, `name`, `phone`, `email`, `home_base`, `active`, `created_at`, `updated_at`) VALUES
('10000000-0000-0000-0000-000000000001', 'PHOTOGRAPHER', 'Rina', '0812xxxxxxx', NULL, '-6.2,106.8', 1, '2025-09-03 23:39:24.582', '2025-09-03 23:39:24.582'),
('10000000-0000-0000-0000-000000000002', 'EDITOR', 'Andi', '0813xxxxxxx', NULL, NULL, 1, '2025-09-03 23:39:24.582', '2025-09-03 23:39:24.582');

-- --------------------------------------------------------

--
-- Struktur dari tabel `status_log`
--

CREATE TABLE `status_log` (
  `id` char(36) NOT NULL,
  `booking_id` char(36) NOT NULL,
  `from_status` enum('INQUIRY','HOLD','CONFIRMED','SCHEDULED','IN_PROGRESS','EDITING','REVIEW','DELIVERED','CLOSED','CANCELLED','EXPIRED') DEFAULT NULL,
  `to_status` enum('INQUIRY','HOLD','CONFIRMED','SCHEDULED','IN_PROGRESS','EDITING','REVIEW','DELIVERED','CLOSED','CANCELLED','EXPIRED') NOT NULL,
  `actor_id` char(36) DEFAULT NULL,
  `note` varchar(255) DEFAULT NULL,
  `at_time` datetime(3) NOT NULL DEFAULT current_timestamp(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Struktur dari tabel `time_blocks`
--

CREATE TABLE `time_blocks` (
  `id` char(36) NOT NULL,
  `staff_id` char(36) NOT NULL,
  `booking_id` char(36) DEFAULT NULL,
  `type` enum('BOOKING','BUFFER','TRAVEL','OFF') NOT NULL,
  `start_at` datetime(3) NOT NULL,
  `end_at` datetime(3) NOT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updated_at` datetime(3) NOT NULL DEFAULT current_timestamp(3) ON UPDATE current_timestamp(3)
) ;

--
-- Dumping data untuk tabel `time_blocks`
--

INSERT INTO `time_blocks` (`id`, `staff_id`, `booking_id`, `type`, `start_at`, `end_at`, `created_at`, `updated_at`) VALUES
('40000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000001', 'BOOKING', '2025-09-20 02:00:00.000', '2025-09-20 04:00:00.000', '2025-09-03 23:40:39.170', '2025-09-03 23:40:39.170');

--
-- Trigger `time_blocks`
--
DELIMITER $$
CREATE TRIGGER `trg_tb_no_overlap_insert` BEFORE INSERT ON `time_blocks` FOR EACH ROW BEGIN
  IF EXISTS (
    SELECT 1 FROM time_blocks t
    WHERE t.staff_id = NEW.staff_id
      AND NOT (NEW.end_at <= t.start_at OR NEW.start_at >= t.end_at)
  ) THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'Time block overlaps with existing block for this staff member';
  END IF;
END
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `trg_tb_no_overlap_update` BEFORE UPDATE ON `time_blocks` FOR EACH ROW BEGIN
  IF EXISTS (
    SELECT 1 FROM time_blocks t
    WHERE t.staff_id = NEW.staff_id
      AND t.id <> NEW.id
      AND NOT (NEW.end_at <= t.start_at OR NEW.start_at >= t.end_at)
  ) THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'Time block overlaps with existing block for this staff member';
  END IF;
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Struktur dari tabel `users`
--

CREATE TABLE `users` (
  `id` char(36) NOT NULL,
  `role` enum('ADMIN','MANAGER','CLIENT') NOT NULL,
  `name` varchar(120) NOT NULL,
  `phone` varchar(50) DEFAULT NULL,
  `email` varchar(190) DEFAULT NULL,
  `address` varchar(255) DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updated_at` datetime(3) NOT NULL DEFAULT current_timestamp(3) ON UPDATE current_timestamp(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `users`
--

INSERT INTO `users` (`id`, `role`, `name`, `phone`, `email`, `address`, `notes`, `created_at`, `updated_at`) VALUES
('00000000-0000-0000-0000-000000000001', 'ADMIN', 'Admin', NULL, 'admin@example.com', NULL, NULL, '2025-09-03 23:38:52.444', '2025-09-03 23:38:52.444'),
('00000000-0000-0000-0000-000000000002', 'MANAGER', 'Manager', NULL, 'manager@example.com', NULL, NULL, '2025-09-03 23:38:52.444', '2025-09-03 23:38:52.444'),
('00000000-0000-0000-0000-000000000003', 'CLIENT', 'Budi', NULL, 'budi@example.com', NULL, NULL, '2025-09-03 23:38:52.444', '2025-09-03 23:38:52.444');

--
-- Indexes for dumped tables
--

--
-- Indeks untuk tabel `add_ons`
--
ALTER TABLE `add_ons`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_addon_name` (`name`);

--
-- Indeks untuk tabel `assignments`
--
ALTER TABLE `assignments`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_assignment_unique` (`booking_id`,`staff_id`,`role`),
  ADD KEY `idx_asg_staff` (`staff_id`);

--
-- Indeks untuk tabel `bookings`
--
ALTER TABLE `bookings`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_bookings_package` (`package_id`),
  ADD KEY `idx_bookings_status_date` (`status`,`event_date`),
  ADD KEY `idx_bookings_client` (`client_id`);

--
-- Indeks untuk tabel `booking_items`
--
ALTER TABLE `booking_items`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_bi_unique` (`booking_id`,`add_on_id`),
  ADD KEY `fk_bi_addon` (`add_on_id`);

--
-- Indeks untuk tabel `delivery_assets`
--
ALTER TABLE `delivery_assets`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_da_booking` (`booking_id`);

--
-- Indeks untuk tabel `leads`
--
ALTER TABLE `leads`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_leads_client` (`client_id`);

--
-- Indeks untuk tabel `packages`
--
ALTER TABLE `packages`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_package_per_service` (`service_id`,`name`),
  ADD KEY `idx_packages_service` (`service_id`);

--
-- Indeks untuk tabel `payments`
--
ALTER TABLE `payments`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_pay_booking` (`booking_id`,`paid_at`);

--
-- Indeks untuk tabel `services`
--
ALTER TABLE `services`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_services_name` (`name`);

--
-- Indeks untuk tabel `staff`
--
ALTER TABLE `staff`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_staff_type` (`staff_type`),
  ADD KEY `idx_staff_active` (`active`),
  ADD KEY `idx_staff_name` (`name`);

--
-- Indeks untuk tabel `status_log`
--
ALTER TABLE `status_log`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_sl_actor` (`actor_id`),
  ADD KEY `idx_sl_booking` (`booking_id`,`at_time`);

--
-- Indeks untuk tabel `time_blocks`
--
ALTER TABLE `time_blocks`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_tb_booking` (`booking_id`),
  ADD KEY `idx_tb_staff_time` (`staff_id`,`start_at`,`end_at`);

--
-- Indeks untuk tabel `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD KEY `idx_users_role` (`role`),
  ADD KEY `idx_users_name` (`name`);

--
-- Ketidakleluasaan untuk tabel pelimpahan (Dumped Tables)
--

--
-- Ketidakleluasaan untuk tabel `assignments`
--
ALTER TABLE `assignments`
  ADD CONSTRAINT `fk_asg_booking` FOREIGN KEY (`booking_id`) REFERENCES `bookings` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_asg_staff` FOREIGN KEY (`staff_id`) REFERENCES `staff` (`id`) ON DELETE CASCADE;

--
-- Ketidakleluasaan untuk tabel `bookings`
--
ALTER TABLE `bookings`
  ADD CONSTRAINT `fk_bookings_client` FOREIGN KEY (`client_id`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `fk_bookings_package` FOREIGN KEY (`package_id`) REFERENCES `packages` (`id`);

--
-- Ketidakleluasaan untuk tabel `booking_items`
--
ALTER TABLE `booking_items`
  ADD CONSTRAINT `fk_bi_addon` FOREIGN KEY (`add_on_id`) REFERENCES `add_ons` (`id`),
  ADD CONSTRAINT `fk_bi_booking` FOREIGN KEY (`booking_id`) REFERENCES `bookings` (`id`) ON DELETE CASCADE;

--
-- Ketidakleluasaan untuk tabel `delivery_assets`
--
ALTER TABLE `delivery_assets`
  ADD CONSTRAINT `fk_da_booking` FOREIGN KEY (`booking_id`) REFERENCES `bookings` (`id`) ON DELETE CASCADE;

--
-- Ketidakleluasaan untuk tabel `leads`
--
ALTER TABLE `leads`
  ADD CONSTRAINT `fk_leads_client` FOREIGN KEY (`client_id`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Ketidakleluasaan untuk tabel `packages`
--
ALTER TABLE `packages`
  ADD CONSTRAINT `fk_packages_service` FOREIGN KEY (`service_id`) REFERENCES `services` (`id`) ON DELETE CASCADE;

--
-- Ketidakleluasaan untuk tabel `payments`
--
ALTER TABLE `payments`
  ADD CONSTRAINT `fk_pay_booking` FOREIGN KEY (`booking_id`) REFERENCES `bookings` (`id`) ON DELETE CASCADE;

--
-- Ketidakleluasaan untuk tabel `status_log`
--
ALTER TABLE `status_log`
  ADD CONSTRAINT `fk_sl_actor` FOREIGN KEY (`actor_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_sl_booking` FOREIGN KEY (`booking_id`) REFERENCES `bookings` (`id`) ON DELETE CASCADE;

--
-- Ketidakleluasaan untuk tabel `time_blocks`
--
ALTER TABLE `time_blocks`
  ADD CONSTRAINT `fk_tb_booking` FOREIGN KEY (`booking_id`) REFERENCES `bookings` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_tb_staff` FOREIGN KEY (`staff_id`) REFERENCES `staff` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
