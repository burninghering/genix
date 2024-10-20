-- --------------------------------------------------------
-- 호스트:                          192.168.0.231
-- 서버 버전:                        10.6.18-MariaDB-0ubuntu0.22.04.1 - Ubuntu 22.04
-- 서버 OS:                        debian-linux-gnu
-- HeidiSQL 버전:                  12.8.0.6908
-- --------------------------------------------------------

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET NAMES utf8 */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;


-- netro_data_platform 데이터베이스 구조 내보내기
DROP DATABASE IF EXISTS `netro_data_platform`;
CREATE DATABASE IF NOT EXISTS `netro_data_platform` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci */;
USE `netro_data_platform`;

-- 프로시저 netro_data_platform.PROC_INSERT_DATA 구조 내보내기
DROP PROCEDURE IF EXISTS `PROC_INSERT_DATA`;
DELIMITER //
CREATE PROCEDURE `PROC_INSERT_DATA`(
	IN `_DEV_ID` INT,
	IN `_SEN_ID` INT,
	IN `_SEN_VALUE` VARCHAR(50)
)
BEGIN
    DECLARE p_timestamp DATETIME;
    SET p_timestamp = NOW();
    
    -- Check if the record exists
    IF EXISTS (
        SELECT 1
        FROM tb_log_data_latest
        WHERE DEV_ID = _DEV_ID AND SEN_ID = _SEN_ID
    ) THEN
        -- If it exists, update the record
        UPDATE tb_log_data_latest
        SET SEN_VALUE = _SEN_VALUE, LOG_DATETIME = p_timestamp
        WHERE DEV_ID = _DEV_ID AND SEN_ID = _SEN_ID;
    ELSE
        -- If it does not exist, insert a new record
        INSERT INTO tb_log_data_latest (LOG_DATETIME, DEV_ID, SEN_ID, SEN_VALUE, ALT_ID)
        VALUES (p_timestamp, _DEV_ID , _SEN_ID, _SEN_VALUE, NULL);
    END IF;
    
    INSERT INTO tb_log_data (LOG_DATETIME, DEV_ID, SEN_ID, SEN_VALUE, ALT_ID) VALUES (p_timestamp, _DEV_ID , _SEN_ID, _SEN_VALUE, NULL);
END//
DELIMITER ;

-- 프로시저 netro_data_platform.PROC_INSERT_STATUS 구조 내보내기
DROP PROCEDURE IF EXISTS `PROC_INSERT_STATUS`;
DELIMITER //
CREATE PROCEDURE `PROC_INSERT_STATUS`(
	IN `_DEV_ID` INT,
	IN `_DEV_STATUS_ID` INT
)
BEGIN
    DECLARE p_timestamp DATETIME;
    SET p_timestamp = NOW();
    
    -- Check if the record exists
    IF EXISTS (
        SELECT 1
        FROM tb_log_dev_latest
        WHERE DEV_ID = _DEV_ID
    ) THEN
        -- If it exists, update the record
        UPDATE tb_log_dev_latest
        SET DEV_STATUS_ID = _DEV_STATUS_ID, LOG_DATETIME = p_timestamp
        WHERE DEV_ID = _DEV_ID;
    ELSE
        -- If it does not exist, insert a new record
        INSERT INTO tb_log_dev_latest (LOG_DATETIME, DEV_ID, DEV_STATUS_ID)
        VALUES (p_timestamp, _DEV_ID , _DEV_STATUS_ID);
    END IF;
    
    INSERT INTO tb_log_dev (LOG_DATETIME, DEV_ID, DEV_STATUS_ID) VALUES (p_timestamp, _DEV_ID, _DEV_STATUS_ID);
END//
DELIMITER ;

-- 프로시저 netro_data_platform.PROC_LATEST_DEV_VALUE 구조 내보내기
DROP PROCEDURE IF EXISTS `PROC_LATEST_DEV_VALUE`;
DELIMITER //
CREATE PROCEDURE `PROC_LATEST_DEV_VALUE`(
	IN `_DEV_ID` INT
)
BEGIN
	SELECT 
	    l.log_datetime,
	    l.DEV_ID, 
	    l.SEN_ID, 
	    sub.SEN_NAME,
	    l.SEN_VALUE
	FROM 
	    tb_log_data_latest l
	JOIN 
	    (SELECT 
	    		DEV_ID,
	    		SEN_ID,
	      	SEN_NAME
	     FROM 
	        tb_sys_sensor
	     GROUP BY 
	        DEV_ID, SEN_ID) AS sub
	ON 
	    l.DEV_ID = sub.DEV_ID  AND l.SEN_ID = sub.SEN_ID
	WHERE
	    l.DEV_ID = _DEV_ID AND l.SEN_ID = sub.SEN_ID;
END//
DELIMITER ;

-- 프로시저 netro_data_platform.PROC_LATEST_STATUS 구조 내보내기
DROP PROCEDURE IF EXISTS `PROC_LATEST_STATUS`;
DELIMITER //
CREATE PROCEDURE `PROC_LATEST_STATUS`()
BEGIN
	SELECT
	        log_datetime,
	        DEV_ID,
	        DEV_STATUS_ID
	FROM (
	    SELECT
	        log_datetime,
	        DEV_ID,
	        DEV_STATUS_ID,
	        ROW_NUMBER() OVER (PARTITION BY DEV_ID ORDER BY log_datetime DESC) AS rn
	    FROM
	        tb_log_dev_latest l, tb_sys_device d
	   	WHERE l.DEV_ID = d.ID
	) subquery
	WHERE
	    subquery.rn = 1
	ORDER BY DEV_ID ASC;
END//
DELIMITER ;

-- 프로시저 netro_data_platform.PROC_LATEST_VALUE 구조 내보내기
DROP PROCEDURE IF EXISTS `PROC_LATEST_VALUE`;
DELIMITER //
CREATE PROCEDURE `PROC_LATEST_VALUE`()
BEGIN
	SELECT
	        log_datetime,
	        DEV_ID,
	        SEN_ID,
	        SEN_VALUE
	FROM (
	    SELECT
	        log_datetime,
	        DEV_ID,
	        SEN_ID,
	        SEN_VALUE,
	        ROW_NUMBER() OVER (PARTITION BY dev_id, sen_id ORDER BY log_datetime DESC) AS rn
	    FROM
	        tb_log_data
	) subquery
	WHERE
	    subquery.rn = 1;
END//
DELIMITER ;

-- 테이블 netro_data_platform.tb_list_mw 구조 내보내기
DROP TABLE IF EXISTS `tb_list_mw`;
CREATE TABLE IF NOT EXISTS `tb_list_mw` (
  `SITE_ID` int(11) DEFAULT NULL,
  `MW_ID` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- 내보낼 데이터가 선택되어 있지 않습니다.

-- 테이블 netro_data_platform.tb_log_data 구조 내보내기
DROP TABLE IF EXISTS `tb_log_data`;
CREATE TABLE IF NOT EXISTS `tb_log_data` (
  `log_datetime` varchar(255) DEFAULT NULL,
  `DEV_ID` int(11) DEFAULT NULL,
  `SEN_ID` int(11) DEFAULT NULL,
  `sen_value` varchar(255) DEFAULT NULL,
  `ALT_ID` int(11) DEFAULT NULL,
  KEY `idx_log_data` (`log_datetime`,`DEV_ID`,`SEN_ID`) USING BTREE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- 내보낼 데이터가 선택되어 있지 않습니다.

-- 테이블 netro_data_platform.tb_log_data_latest 구조 내보내기
DROP TABLE IF EXISTS `tb_log_data_latest`;
CREATE TABLE IF NOT EXISTS `tb_log_data_latest` (
  `log_datetime` varchar(255) DEFAULT NULL,
  `DEV_ID` int(11) DEFAULT NULL,
  `SEN_ID` int(11) DEFAULT NULL,
  `SEN_VALUE` varchar(50) DEFAULT NULL,
  `ALT_ID` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- 내보낼 데이터가 선택되어 있지 않습니다.

-- 테이블 netro_data_platform.tb_log_data_seq 구조 내보내기
DROP TABLE IF EXISTS `tb_log_data_seq`;
CREATE TABLE IF NOT EXISTS `tb_log_data_seq` (
  `next_val` bigint(20) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- 내보낼 데이터가 선택되어 있지 않습니다.

-- 테이블 netro_data_platform.tb_log_dev 구조 내보내기
DROP TABLE IF EXISTS `tb_log_dev`;
CREATE TABLE IF NOT EXISTS `tb_log_dev` (
  `log_datetime` varchar(255) NOT NULL,
  `DEV_ID` int(11) DEFAULT NULL,
  `DEV_STATUS_ID` int(11) DEFAULT NULL,
  KEY `idx_log_dev` (`log_datetime`,`DEV_ID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- 내보낼 데이터가 선택되어 있지 않습니다.

-- 테이블 netro_data_platform.tb_log_dev_latest 구조 내보내기
DROP TABLE IF EXISTS `tb_log_dev_latest`;
CREATE TABLE IF NOT EXISTS `tb_log_dev_latest` (
  `log_datetime` varchar(255) NOT NULL,
  `DEV_ID` int(11) DEFAULT NULL,
  `DEV_STATUS_ID` int(11) DEFAULT NULL,
  KEY `idx_log_dev` (`log_datetime`,`DEV_ID`) USING BTREE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- 내보낼 데이터가 선택되어 있지 않습니다.

-- 테이블 netro_data_platform.tb_log_user 구조 내보내기
DROP TABLE IF EXISTS `tb_log_user`;
CREATE TABLE IF NOT EXISTS `tb_log_user` (
  `log_datetime` varchar(255) DEFAULT NULL,
  `login_id` varchar(255) DEFAULT NULL,
  `state` varchar(50) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- 내보낼 데이터가 선택되어 있지 않습니다.

-- 테이블 netro_data_platform.tb_sys_alert 구조 내보내기
DROP TABLE IF EXISTS `tb_sys_alert`;
CREATE TABLE IF NOT EXISTS `tb_sys_alert` (
  `ID` int(11) DEFAULT NULL,
  `ALERT` varchar(10) DEFAULT NULL,
  `DETAIL` varchar(50) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- 내보낼 데이터가 선택되어 있지 않습니다.

-- 테이블 netro_data_platform.tb_sys_cert 구조 내보내기
DROP TABLE IF EXISTS `tb_sys_cert`;
CREATE TABLE IF NOT EXISTS `tb_sys_cert` (
  `CERT_KEY` varchar(30) DEFAULT NULL,
  `last_update` varchar(255) DEFAULT NULL,
  `start_date` date DEFAULT NULL,
  `end_date` date DEFAULT NULL,
  `enabled` int(11) NOT NULL,
  UNIQUE KEY `CERT_KEY` (`CERT_KEY`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- 내보낼 데이터가 선택되어 있지 않습니다.

-- 테이블 netro_data_platform.tb_sys_device 구조 내보내기
DROP TABLE IF EXISTS `tb_sys_device`;
CREATE TABLE IF NOT EXISTS `tb_sys_device` (
  `ID` int(11) NOT NULL AUTO_INCREMENT,
  `DEV_TYPE_ID` int(11) DEFAULT NULL,
  `dev_name` varchar(255) DEFAULT NULL,
  `dev_detail` varchar(255) DEFAULT NULL,
  `SEN_CNT` int(11) DEFAULT NULL,
  `loc_lati` varchar(255) DEFAULT NULL,
  `loc_long` varchar(255) DEFAULT NULL,
  `loc_addr` varchar(255) DEFAULT NULL,
  `LOC_X` double DEFAULT NULL,
  `LOC_Y` double DEFAULT NULL,
  `LOC_Z` double DEFAULT NULL,
  `DEV_ENDPOINT` varchar(150) DEFAULT NULL,
  PRIMARY KEY (`ID`)
) ENGINE=InnoDB AUTO_INCREMENT=102 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- 내보낼 데이터가 선택되어 있지 않습니다.

-- 테이블 netro_data_platform.tb_sys_dev_status 구조 내보내기
DROP TABLE IF EXISTS `tb_sys_dev_status`;
CREATE TABLE IF NOT EXISTS `tb_sys_dev_status` (
  `ID` int(11) DEFAULT NULL,
  `STATUS` varchar(20) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- 내보낼 데이터가 선택되어 있지 않습니다.

-- 테이블 netro_data_platform.tb_sys_dev_type 구조 내보내기
DROP TABLE IF EXISTS `tb_sys_dev_type`;
CREATE TABLE IF NOT EXISTS `tb_sys_dev_type` (
  `ID` int(11) DEFAULT NULL,
  `DEV_ID` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- 내보낼 데이터가 선택되어 있지 않습니다.

-- 테이블 netro_data_platform.tb_sys_mw 구조 내보내기
DROP TABLE IF EXISTS `tb_sys_mw`;
CREATE TABLE IF NOT EXISTS `tb_sys_mw` (
  `ID` int(11) DEFAULT NULL,
  `DEV_CNT` int(11) DEFAULT NULL,
  `MW_NAME` varchar(50) DEFAULT NULL,
  `MW_DETAIL` varchar(100) DEFAULT NULL,
  `CERT_KEY` varchar(30) DEFAULT NULL,
  `enabled` int(11) NOT NULL,
  `dev_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- 내보낼 데이터가 선택되어 있지 않습니다.

-- 테이블 netro_data_platform.tb_sys_sensor 구조 내보내기
DROP TABLE IF EXISTS `tb_sys_sensor`;
CREATE TABLE IF NOT EXISTS `tb_sys_sensor` (
  `ID` int(11) NOT NULL AUTO_INCREMENT,
  `DEV_ID` int(11) DEFAULT NULL,
  `SEN_ID` int(11) DEFAULT NULL,
  `sen_name` varchar(255) DEFAULT NULL,
  `ID_VLU_TYPE` int(11) DEFAULT NULL,
  `DFT_VALUE` varchar(50) DEFAULT NULL,
  `MAX_VALUE` varchar(50) DEFAULT NULL,
  `MIN_VALUE` varchar(50) DEFAULT NULL,
  `UNIT` varchar(10) DEFAULT NULL,
  PRIMARY KEY (`ID`),
  KEY `idx_sys_sensor` (`DEV_ID`,`SEN_ID`) USING BTREE
) ENGINE=InnoDB AUTO_INCREMENT=56 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- 내보낼 데이터가 선택되어 있지 않습니다.

-- 테이블 netro_data_platform.tb_sys_site 구조 내보내기
DROP TABLE IF EXISTS `tb_sys_site`;
CREATE TABLE IF NOT EXISTS `tb_sys_site` (
  `ID` int(11) DEFAULT NULL,
  `SITE_NAME` varchar(50) DEFAULT NULL,
  `SITE_DETAIL` varchar(150) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- 내보낼 데이터가 선택되어 있지 않습니다.

-- 테이블 netro_data_platform.tb_sys_user 구조 내보내기
DROP TABLE IF EXISTS `tb_sys_user`;
CREATE TABLE IF NOT EXISTS `tb_sys_user` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `login_id` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `nickname` varchar(255) DEFAULT NULL,
  `password` varchar(255) DEFAULT NULL,
  `role` int(11) NOT NULL,
  `salt` varchar(255) DEFAULT NULL,
  `token` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=131 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- 내보낼 데이터가 선택되어 있지 않습니다.

-- 테이블 netro_data_platform.tb_sys_vlu_type 구조 내보내기
DROP TABLE IF EXISTS `tb_sys_vlu_type`;
CREATE TABLE IF NOT EXISTS `tb_sys_vlu_type` (
  `ID` int(11) DEFAULT NULL,
  `VLU_TYPE` varchar(10) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- 내보낼 데이터가 선택되어 있지 않습니다.

/*!40103 SET TIME_ZONE=IFNULL(@OLD_TIME_ZONE, 'system') */;
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IFNULL(@OLD_FOREIGN_KEY_CHECKS, 1) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40111 SET SQL_NOTES=IFNULL(@OLD_SQL_NOTES, 1) */;
