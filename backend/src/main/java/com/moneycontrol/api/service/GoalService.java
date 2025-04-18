package com.moneycontrol.api.service;

import com.moneycontrol.api.dto.GoalDto;
import com.moneycontrol.api.dto.PageResponse;
import com.moneycontrol.api.exception.ResourceNotFoundException;
import com.moneycontrol.api.model.Goal;
import com.moneycontrol.api.model.User;
import com.moneycontrol.api.repository.GoalRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class GoalService {

    private final GoalRepository goalRepository;
    private final UserService userService;

    public List<Goal> getAllGoalsByUser(String email) {
        User user = userService.getCurrentUser(email);
        return goalRepository.findByUser(user);
    }

    public PageResponse<Goal> getAllGoalsByUser(String email, int pageNo, int pageSize, String sortBy, String sortDir) {
        User user = userService.getCurrentUser(email);
        Sort sort = sortDir.equalsIgnoreCase(Sort.Direction.ASC.name()) ?
                Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(pageNo, pageSize, sort);
        Page<Goal> page = goalRepository.findByUser(user, pageable);
        return PageResponse.of(page);
    }

    public Goal getGoalById(Long id, String email) {
        User user = userService.getCurrentUser(email);
        Goal goal = goalRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Goal not found with id: " + id));

        if (!goal.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Goal does not belong to the current user");
        }

        return goal;
    }

    public Goal createGoal(GoalDto goalDto, String email) {
        User user = userService.getCurrentUser(email);

        Goal goal = new Goal();
        goal.setName(goalDto.getName());
        goal.setDescription(goalDto.getDescription());
        goal.setTargetAmount(goalDto.getTargetAmount());
        goal.setCurrentAmount(goalDto.getCurrentAmount());
        goal.setTargetDate(goalDto.getTargetDate());
        goal.setUser(user);

        return goalRepository.save(goal);
    }

    public Goal updateGoal(Long id, GoalDto goalDto, String email) {
        Goal goal = getGoalById(id, email);

        goal.setName(goalDto.getName());
        goal.setDescription(goalDto.getDescription());
        goal.setTargetAmount(goalDto.getTargetAmount());
        goal.setCurrentAmount(goalDto.getCurrentAmount());
        goal.setTargetDate(goalDto.getTargetDate());

        return goalRepository.save(goal);
    }

    public void deleteGoal(Long id, String email) {
        Goal goal = getGoalById(id, email);
        goalRepository.delete(goal);
    }
}
