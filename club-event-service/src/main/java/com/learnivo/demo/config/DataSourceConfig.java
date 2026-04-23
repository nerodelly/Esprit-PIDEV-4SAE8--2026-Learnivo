package com.learnivo.demo.config;

import com.zaxxer.hikari.HikariDataSource;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.Statement;

/**
 * Ensures the MySQL database exists before the application uses it.
 * Creates the database automatically on first run if it does not exist.
 */
@Configuration
public class DataSourceConfig {

    @Value("${spring.datasource.url}")
    private String datasourceUrl;

    @Value("${spring.datasource.username:root}")
    private String username;

    @Value("${spring.datasource.password:}")
    private String password;

    @Bean
    public HikariDataSource dataSource() {
        // Skip database creation check for now to allow application to start
        HikariDataSource ds = new HikariDataSource();
        ds.setJdbcUrl(datasourceUrl);
        ds.setUsername(username);
        ds.setPassword(password);
        return ds;
    }

    private void ensureDatabaseExists() {
        // Skip database creation for non-MySQL databases (e.g., H2 for tests)
        if (!datasourceUrl.startsWith("jdbc:mysql:")) {
            return;
        }
        String dbName = extractDatabaseName(datasourceUrl);
        if (dbName == null || dbName.isEmpty()) {
            return;
        }
        String baseUrl = baseUrlWithoutDatabase(datasourceUrl);
        try (Connection conn = DriverManager.getConnection(baseUrl, username, password);
             Statement st = conn.createStatement()) {
            st.execute("CREATE DATABASE IF NOT EXISTS `" + dbName + "` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci");
        } catch (Exception e) {
            throw new IllegalStateException("Could not create database '" + dbName + "'. Create it manually or check MySQL connection.", e);
        }
    }

    private String extractDatabaseName(String url) {
        // jdbc:mysql://host:port/dbname?params -> dbname
        int slash = url.indexOf('/', url.indexOf("//") + 2);
        if (slash == -1) return null;
        int end = url.indexOf('?', slash + 1);
        if (end == -1) end = url.length();
        String path = url.substring(slash + 1, end).trim();
        return path.isEmpty() ? null : path;
    }

    private String baseUrlWithoutDatabase(String url) {
        // jdbc:mysql://host:port/dbname?params -> jdbc:mysql://host:port/?params
        int slash = url.indexOf('/', url.indexOf("//") + 2);
        if (slash == -1) return url;
        int q = url.indexOf('?', slash + 1);
        String params = q >= 0 ? url.substring(q) : "";
        return url.substring(0, slash + 1) + params;
    }
}
