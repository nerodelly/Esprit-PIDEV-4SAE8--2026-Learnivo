-- Creates tables if they don't exist (e.g. for database 'iyadh' or fresh 'learnivo').
-- Spring Boot runs this before Hibernate when spring.sql.init.mode=always.

-- Professors (no FK)
CREATE TABLE IF NOT EXISTS professors (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Students (no FK)
CREATE TABLE IF NOT EXISTS students (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Clubs (depends on professors)
CREATE TABLE IF NOT EXISTS clubs (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description VARCHAR(2000),
  status VARCHAR(255) NOT NULL,
  professor_id BIGINT,
  CONSTRAINT fk_clubs_professor FOREIGN KEY (professor_id) REFERENCES professors(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Events (depends on clubs)
CREATE TABLE IF NOT EXISTS events (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description VARCHAR(2000),
  start_time DATETIME NOT NULL,
  end_time DATETIME NOT NULL,
  location VARCHAR(255),
  status VARCHAR(255) NOT NULL,
  club_id BIGINT,
  created_at DATETIME NOT NULL,
  CONSTRAINT fk_events_club FOREIGN KEY (club_id) REFERENCES clubs(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Club memberships (depends on clubs, students)
CREATE TABLE IF NOT EXISTS club_memberships (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  joined_at DATETIME NOT NULL,
  status VARCHAR(255) NOT NULL,
  club_id BIGINT NOT NULL,
  student_id BIGINT NOT NULL,
  CONSTRAINT fk_club_memberships_club FOREIGN KEY (club_id) REFERENCES clubs(id),
  CONSTRAINT fk_club_memberships_student FOREIGN KEY (student_id) REFERENCES students(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Event registrations (depends on events, students)
CREATE TABLE IF NOT EXISTS event_registrations (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  registered_at DATETIME NOT NULL,
  status VARCHAR(255) NOT NULL,
  event_id BIGINT NOT NULL,
  student_id BIGINT NOT NULL,
  CONSTRAINT fk_event_registrations_event FOREIGN KEY (event_id) REFERENCES events(id),
  CONSTRAINT fk_event_registrations_student FOREIGN KEY (student_id) REFERENCES students(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
