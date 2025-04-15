package com.moneycontrol.api.controller;

import com.moneycontrol.api.dto.GoalDto;
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
    public ResponseEntity<List<Goal>> getAllGoals(Authentication authentication) {
        return ResponseEntity.ok(goalService.getAllGoalsByUser(authentication.getName()));
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
