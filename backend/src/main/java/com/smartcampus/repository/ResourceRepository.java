package com.smartcampus.repository;

import com.smartcampus.model.Resource;
import com.smartcampus.model.ResourceStatus;
import com.smartcampus.model.ResourceType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ResourceRepository extends JpaRepository<Resource, String> {

    @Query("""
            SELECT r FROM Resource r
            WHERE (:type IS NULL OR r.type = :type)
              AND (:minCapacity IS NULL OR r.capacity >= :minCapacity)
              AND (:location IS NULL OR LOWER(r.location) LIKE LOWER(CONCAT('%', :location, '%')))
              AND (:status IS NULL OR r.status = :status)
            ORDER BY r.createdAt DESC
            """)
    List<Resource> search(
            @Param("type") ResourceType type,
            @Param("minCapacity") Integer minCapacity,
            @Param("location") String location,
            @Param("status") ResourceStatus status
    );
}
