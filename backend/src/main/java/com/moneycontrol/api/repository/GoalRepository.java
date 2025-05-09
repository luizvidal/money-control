package com.moneycontrol.api.repository;

import com.moneycontrol.api.model.Goal;
import com.moneycontrol.api.model.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface GoalRepository extends JpaRepository<Goal, Long> {
    Page<Goal> findByUser(User user, Pageable pageable);
    List<Goal> findByUser(User user);
}
