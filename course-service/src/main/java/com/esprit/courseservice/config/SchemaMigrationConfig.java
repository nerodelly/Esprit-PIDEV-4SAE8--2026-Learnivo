package com.esprit.courseservice.config;

import java.sql.Connection;
import java.sql.DatabaseMetaData;
import java.sql.SQLException;
import javax.sql.DataSource;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.jdbc.core.JdbcTemplate;

@Configuration
public class SchemaMigrationConfig {

    @Bean
    CommandLineRunner ensureLargeContentColumns(DataSource dataSource, JdbcTemplate jdbcTemplate) {
        return args -> {
            try (Connection connection = dataSource.getConnection()) {
                DatabaseMetaData metadata = connection.getMetaData();
                String databaseName = metadata.getDatabaseProductName();
                if (databaseName == null || !databaseName.toLowerCase().contains("mysql")) {
                    return;
                }
            }

            jdbcTemplate.execute("ALTER TABLE courses MODIFY COLUMN image LONGTEXT NOT NULL");
            jdbcTemplate.execute("ALTER TABLE courses MODIFY COLUMN banner LONGTEXT NOT NULL");
            jdbcTemplate.execute("ALTER TABLE course_chapters MODIFY COLUMN pdf_url LONGTEXT NOT NULL");
        };
    }
}
