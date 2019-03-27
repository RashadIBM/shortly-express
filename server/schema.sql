DROP DATABASE shortly;
CREATE DATABASE shortly;

USE shortly;

CREATE TABLE `users` (
  `id` INT AUTO_INCREMENT,
  `username` VARCHAR(32),
  `password` VARCHAR(32),
  PRIMARY KEY (`id`)
)

-- mysql -u root < server/schema.sql
