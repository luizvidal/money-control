package com.moneycontrol.api.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class CategoryDto {
    
    private Long id;
    
    @NotBlank
    @Size(max = 50)
    private String name;
    
    @Size(max = 255)
    private String description;
}
