package com.smartcampus.controller;

import com.smartcampus.dto.request.ResourceRequest;
import com.smartcampus.dto.response.ApiResponse;
import com.smartcampus.dto.response.ResourceResponse;
import com.smartcampus.service.ResourceService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/resources")
@RequiredArgsConstructor
public class ResourceController {

    private final ResourceService resourceService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<ResourceResponse>>> getAll() {
        return ResponseEntity.ok(
                ApiResponse.success("Resources retrieved", resourceService.getAll()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ResourceResponse>> getById(@PathVariable String id) {
        return ResponseEntity.ok(
                ApiResponse.success("Resource retrieved", resourceService.getById(id)));
    }

    @GetMapping("/search")
    public ResponseEntity<ApiResponse<List<ResourceResponse>>> search(
            @RequestParam(required = false) String type,
            @RequestParam(required = false) Integer minCapacity,
            @RequestParam(required = false) String location,
            @RequestParam(required = false) String status) {
        return ResponseEntity.ok(
                ApiResponse.success("Search results",
                        resourceService.search(type, minCapacity, location, status)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<ResourceResponse>> create(
            @Valid @RequestBody ResourceRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(
                ApiResponse.success("Resource created", resourceService.create(request)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<ResourceResponse>> update(
            @PathVariable String id,
            @Valid @RequestBody ResourceRequest request) {
        return ResponseEntity.ok(
                ApiResponse.success("Resource updated", resourceService.update(id, request)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable String id) {
        resourceService.delete(id);
        return ResponseEntity.ok(ApiResponse.success("Resource deleted", null));
    }
}
