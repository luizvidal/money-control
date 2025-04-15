package com.moneycontrol.api.controller;

import com.moneycontrol.api.dto.GoalDto;
import com.moneycontrol.api.dto.PageResponse;
import com.moneycontrol.api.model.Goal;
import com.moneycontrol.api.service.GoalService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/goals")
@RequiredArgsConstructor
public class GoalController {

    private final GoalService goalService;

    @GetMapping
    public ResponseEntity<?> getAllGoals(
            Authentication authentication,
            @RequestParam(value = "pageNo", defaultValue = "0", required = false) int pageNo,
            @RequestParam(value = "pageSize", defaultValue = "10", required = false) int pageSize,
            @RequestParam(value = "sortBy", defaultValue = "targetDate", required = false) String sortBy,
            @RequestParam(value = "sortDir", defaultValue = "asc", required = false) String sortDir) {

        if (pageSize > 0) {
            return ResponseEntity.ok(goalService.getAllGoalsByUser(
                    authentication.getName(), pageNo, pageSize, sortBy, sortDir));
        } else {
            return ResponseEntity.ok(goalService.getAllGoalsByUser(authentication.getName()));
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<Goal> getGoalById(@PathVariable Long id, Authentication authentication) {
        return ResponseEntity.ok(goalService.getGoalById(id, authentication.getName()));
    }

    @PostMapping
    public ResponseEntity<Goal> createGoal(@Valid @RequestBody GoalDto goalDto, Authentication authentication) {
        return ResponseEntity.ok(goalService.createGoal(goalDto, authentication.getName()));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Goal> updateGoal(@PathVariable Long id, @Valid @RequestBody GoalDto goalDto,
                                          Authentication authentication) {
        return ResponseEntity.ok(goalService.updateGoal(id, goalDto, authentication.getName()));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteGoal(@PathVariable Long id, Authentication authentication) {
        goalService.deleteGoal(id, authentication.getName());
        return ResponseEntity.ok("Goal deleted successfully");
    }
}
