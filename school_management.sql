-- phpMyAdmin SQL Dump
-- version 5.1.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1:3306
-- Generation Time: Jul 14, 2025 at 08:56 AM
-- Server version: 5.7.36
-- PHP Version: 8.0.13

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `school_management`
--

-- --------------------------------------------------------

--
-- Table structure for table `attendance`
--

DROP TABLE IF EXISTS `attendance`;
CREATE TABLE IF NOT EXISTS `attendance` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `student_id` varchar(50) NOT NULL,
  `date` date NOT NULL,
  `present` tinyint(1) DEFAULT '0',
  `attendance_time` time DEFAULT NULL,
  `marked_by` varchar(100) NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_attendance` (`student_id`,`date`),
  KEY `idx_date` (`date`),
  KEY `idx_student_date` (`student_id`,`date`)
) ENGINE=InnoDB AUTO_INCREMENT=189 DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `attendance`
--

INSERT INTO `attendance` (`id`, `student_id`, `date`, `present`, `attendance_time`, `marked_by`, `created_at`) VALUES
(159, '14', '2025-07-14', 1, '13:48:30', 'Kamal', '2025-07-14 02:48:30'),
(160, '9', '2025-07-14', 1, '13:48:30', 'Kamal', '2025-07-14 02:48:30'),
(161, '11', '2025-07-14', 1, '13:48:30', 'Kamal', '2025-07-14 02:48:30'),
(162, '15', '2025-07-14', 1, '13:48:30', 'Kamal', '2025-07-14 02:48:30'),
(163, '8', '2025-07-14', 1, '13:48:30', 'Kamal', '2025-07-14 02:48:30'),
(164, '13', '2025-07-14', 0, '13:48:30', 'Kamal', '2025-07-14 02:48:30'),
(165, '12', '2025-07-14', 0, '13:48:30', 'Kamal', '2025-07-14 02:48:30'),
(166, '6', '2025-07-14', 0, '13:48:30', 'Kamal', '2025-07-14 02:48:30'),
(167, '10', '2025-07-14', 0, '13:48:30', 'Kamal', '2025-07-14 02:48:30'),
(168, '7', '2025-07-14', 0, '13:48:30', 'Kamal', '2025-07-14 02:48:30'),
(169, '16', '2025-07-14', 1, '13:48:39', 'sarath', '2025-07-14 02:48:39'),
(170, '25', '2025-07-14', 0, '13:48:39', 'sarath', '2025-07-14 02:48:39'),
(171, '19', '2025-07-14', 0, '13:48:39', 'sarath', '2025-07-14 02:48:39'),
(172, '20', '2025-07-14', 0, '13:48:39', 'sarath', '2025-07-14 02:48:39'),
(173, '22', '2025-07-14', 0, '13:48:39', 'sarath', '2025-07-14 02:48:39'),
(174, '23', '2025-07-14', 0, '13:48:39', 'sarath', '2025-07-14 02:48:39'),
(175, '17', '2025-07-14', 0, '13:48:39', 'sarath', '2025-07-14 02:48:39'),
(176, '21', '2025-07-14', 0, '13:48:39', 'sarath', '2025-07-14 02:48:39'),
(177, '24', '2025-07-14', 0, '13:48:39', 'sarath', '2025-07-14 02:48:39'),
(178, '18', '2025-07-14', 0, '13:48:39', 'sarath', '2025-07-14 02:48:39'),
(179, '35', '2025-07-14', 0, '13:48:50', 'Nalaka', '2025-07-14 02:48:50'),
(180, '33', '2025-07-14', 0, '13:48:50', 'Nalaka', '2025-07-14 02:48:50'),
(181, '30', '2025-07-14', 1, '13:48:50', 'Nalaka', '2025-07-14 02:48:50'),
(182, '26', '2025-07-14', 1, '13:48:50', 'Nalaka', '2025-07-14 02:48:50'),
(183, '32', '2025-07-14', 1, '13:48:50', 'Nalaka', '2025-07-14 02:48:50'),
(184, '31', '2025-07-14', 1, '13:48:50', 'Nalaka', '2025-07-14 02:48:50'),
(185, '27', '2025-07-14', 1, '13:48:50', 'Nalaka', '2025-07-14 02:48:50'),
(186, '28', '2025-07-14', 1, '13:48:50', 'Nalaka', '2025-07-14 02:48:50'),
(187, '29', '2025-07-14', 1, '13:48:50', 'Nalaka', '2025-07-14 02:48:50'),
(188, '34', '2025-07-14', 1, '13:48:50', 'Nalaka', '2025-07-14 02:48:50');

-- --------------------------------------------------------

--
-- Table structure for table `auth_privilege`
--

DROP TABLE IF EXISTS `auth_privilege`;
CREATE TABLE IF NOT EXISTS `auth_privilege` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `role_name` varchar(50) NOT NULL,
  `privilege` json NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM AUTO_INCREMENT=4 DEFAULT CHARSET=latin1;

--
-- Dumping data for table `auth_privilege`
--

INSERT INTO `auth_privilege` (`id`, `role_name`, `privilege`) VALUES
(1, 'Admin', '[\"Dashboard\", \"Student\", \"Teacher\", \"Attendance\", \"Payments\", \"Setting\"]'),
(2, 'Teacher', '[\"Dashboard\", \"Student\", \"Attendance\"]'),
(3, 'Student', '[\"Dashboard\"]');

-- --------------------------------------------------------

--
-- Table structure for table `class`
--

DROP TABLE IF EXISTS `class`;
CREATE TABLE IF NOT EXISTS `class` (
  `class_id` int(11) NOT NULL AUTO_INCREMENT,
  `class_name` varchar(10) NOT NULL,
  PRIMARY KEY (`class_id`),
  UNIQUE KEY `class_name` (`class_name`)
) ENGINE=MyISAM AUTO_INCREMENT=33 DEFAULT CHARSET=latin1;

--
-- Dumping data for table `class`
--

INSERT INTO `class` (`class_id`, `class_name`) VALUES
(1, '6-A'),
(2, '6-B'),
(3, '6-C'),
(4, '6-D'),
(5, '7-A'),
(6, '7-B'),
(7, '7-C'),
(8, '7-D'),
(9, '8-A'),
(10, '8-B'),
(11, '8-C'),
(12, '8-D'),
(13, '9-A'),
(14, '9-B'),
(15, '9-C'),
(16, '9-D'),
(17, '10-A'),
(18, '10-B'),
(19, '10-C'),
(20, '10-D'),
(21, '11-A'),
(22, '11-B'),
(23, '11-C'),
(24, '11-D'),
(25, '12-A'),
(26, '12-B'),
(27, '12-C'),
(28, '12-D'),
(29, '13-A'),
(30, '13-B'),
(31, '13-C'),
(32, '13-D');

-- --------------------------------------------------------

--
-- Table structure for table `payment`
--

DROP TABLE IF EXISTS `payment`;
CREATE TABLE IF NOT EXISTS `payment` (
  `payment_id` int(11) NOT NULL AUTO_INCREMENT,
  `student_id` int(11) NOT NULL,
  `service_type` varchar(100) NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `payment_date` date NOT NULL,
  `payment_time` time NOT NULL,
  PRIMARY KEY (`payment_id`),
  KEY `student_id` (`student_id`)
) ENGINE=MyISAM AUTO_INCREMENT=4 DEFAULT CHARSET=latin1;

--
-- Dumping data for table `payment`
--

INSERT INTO `payment` (`payment_id`, `student_id`, `service_type`, `amount`, `payment_date`, `payment_time`) VALUES
(1, 4, 'Laboratory Fee', '10000.00', '2025-07-11', '08:35:51'),
(2, 1, 'Admission Fee', '1200.00', '2025-07-11', '08:59:36'),
(3, 1, 'Hostel Fee', '1000.00', '2025-07-12', '09:09:57');

-- --------------------------------------------------------

--
-- Table structure for table `student`
--

DROP TABLE IF EXISTS `student`;
CREATE TABLE IF NOT EXISTS `student` (
  `student_id` int(11) NOT NULL AUTO_INCREMENT,
  `student_name` varchar(100) NOT NULL,
  `birth_date` date NOT NULL,
  `gender` enum('Male','Female','Other') NOT NULL,
  `class_id` varchar(10) NOT NULL,
  PRIMARY KEY (`student_id`),
  KEY `class_id` (`class_id`)
) ENGINE=MyISAM AUTO_INCREMENT=37 DEFAULT CHARSET=latin1;

--
-- Dumping data for table `student`
--

INSERT INTO `student` (`student_id`, `student_name`, `birth_date`, `gender`, `class_id`) VALUES
(7, 'Tharindu Perera', '2000-03-12', 'Male', '11'),
(6, 'Sandun Senevirathna', '1999-07-10', 'Male', '11'),
(8, 'Nimasha Lakmali', '2000-11-25', 'Female', '11'),
(9, 'Isuru Fernando', '1999-08-05', 'Male', '11'),
(10, 'Sewwandi Herath', '2001-01-17', 'Female', '11'),
(11, 'Janith Madushan', '2000-04-21', 'Male', '11'),
(12, 'Sachini Weerasinghe', '2000-06-19', 'Female', '11'),
(13, 'Pubudu Dissanayake', '1999-12-30', 'Male', '11'),
(14, 'Dilani Alwis', '2000-07-09', 'Female', '11'),
(15, 'Kavindu Nimesh', '1999-09-14', 'Male', '11'),
(16, 'Chamodi Rathnayake', '2001-02-13', 'Female', '10'),
(17, 'Lahiru Madusanka', '2001-08-22', 'Male', '10'),
(18, 'Umesha Dilrukshi', '2002-05-11', 'Female', '10'),
(19, 'Dinuka Senarath', '2001-04-18', 'Male', '10'),
(20, 'Harshani Samarasinghe', '2002-03-30', 'Female', '10'),
(21, 'Malindu Perera', '2001-09-06', 'Male', '10'),
(22, 'Kalani Nadeeshani', '2002-10-23', 'Female', '10'),
(23, 'Kasun Ranasinghe', '2001-12-08', 'Male', '10'),
(24, 'Sithara Jayawardena', '2002-01-04', 'Female', '10'),
(25, 'Dananjaya Bandara', '2001-06-27', 'Male', '10'),
(26, 'Nethmi Kavindya', '2003-02-14', 'Female', '9'),
(27, 'Roshan Dilshan', '2003-05-03', 'Male', '9'),
(28, 'Sewmini Hansika', '2003-09-10', 'Female', '9'),
(29, 'Thilina Jayasanka', '2003-06-21', 'Male', '9'),
(30, 'Nadeesha Priyangani', '2003-12-19', 'Female', '9'),
(31, 'Pasindu Rajapaksha', '2003-07-15', 'Male', '9'),
(32, 'Nimna Udani', '2003-11-01', 'Female', '9'),
(33, 'Isuru Kalum', '2003-03-28', 'Male', '9'),
(34, 'Thisuri Madushika', '2003-10-06', 'Female', '9'),
(35, 'Chinthaka Senanayake', '2003-08-25', 'Male', '9'),
(36, 'ssss', '2021-07-20', 'Male', '10');

-- --------------------------------------------------------

--
-- Table structure for table `teacher`
--

DROP TABLE IF EXISTS `teacher`;
CREATE TABLE IF NOT EXISTS `teacher` (
  `teacher_id` int(11) NOT NULL AUTO_INCREMENT,
  `teacher_name` varchar(100) NOT NULL,
  `class_name` varchar(10) NOT NULL,
  `gender` enum('Male','Female') NOT NULL,
  `created_date` date NOT NULL,
  `created_time` time NOT NULL,
  PRIMARY KEY (`teacher_id`),
  KEY `class_name` (`class_name`)
) ENGINE=MyISAM AUTO_INCREMENT=9 DEFAULT CHARSET=latin1;

--
-- Dumping data for table `teacher`
--

INSERT INTO `teacher` (`teacher_id`, `teacher_name`, `class_name`, `gender`, `created_date`, `created_time`) VALUES
(1, 'Kamal', '11', 'Male', '2025-07-11', '01:37:24'),
(2, 'Sarath', '10', 'Male', '2025-07-11', '01:38:00'),
(7, 'kasun', '12', 'Male', '2025-07-14', '06:05:22'),
(6, 'Nalaka', '9', 'Male', '2025-07-14', '05:30:37'),
(8, 'nimslll', '9', 'Male', '2025-07-14', '08:48:44');

-- --------------------------------------------------------

--
-- Table structure for table `user`
--

DROP TABLE IF EXISTS `user`;
CREATE TABLE IF NOT EXISTS `user` (
  `user_id` int(11) NOT NULL AUTO_INCREMENT,
  `username` varchar(50) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('Admin','Teacher','Student') NOT NULL,
  PRIMARY KEY (`user_id`),
  UNIQUE KEY `username` (`username`)
) ENGINE=MyISAM AUTO_INCREMENT=10 DEFAULT CHARSET=latin1;

--
-- Dumping data for table `user`
--

INSERT INTO `user` (`user_id`, `username`, `password`, `role`) VALUES
(6, 'Kamal', '$2y$10$6ur3l6PttNqkurHVZ0VDrevwnICS4G7McBxP3ltNCmBqNEmk2Tcfq', 'Teacher'),
(3, 'Sandun', '$2y$10$6.gSaI8KNPTF01XJpJ0a4urbPdoPPymYEPka.D/t4tCaSpU3qzrdC', 'Admin'),
(7, 'Nimal', '$2y$10$kcuAZ.pavF/P.tJ5fcbhzOMrT6yBPMJdDatNRgnORHGh9yz8vuYei', 'Student'),
(8, 'sarath', '$2y$10$ARq2Z5ypzBgAUTEoo/Dx0ONJL9jmO4FJdELYUMAx2VMh/7j0dLfGW', 'Teacher'),
(9, 'Nalaka', '$2y$10$5GoWGjnUyrydccjF/vSpjuNRTKrCLiftbZe8SQ.EeaZVBD2Skf/x6', 'Teacher');
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
