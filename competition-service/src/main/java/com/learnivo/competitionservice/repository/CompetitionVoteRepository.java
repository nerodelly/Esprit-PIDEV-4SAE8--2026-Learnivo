package com.learnivo.competitionservice.repository;

import com.learnivo.competitionservice.entity.CompetitionVote;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CompetitionVoteRepository extends JpaRepository<CompetitionVote, Long> {

    Optional<CompetitionVote> findByCompetitionIdAndVoterEmail(Long competitionId, String voterEmail);

    long countByCompetitionIdAndVoteType(Long competitionId, CompetitionVote.VoteType voteType);

    @Query("SELECT COUNT(v) FROM CompetitionVote v WHERE v.competitionId = :competitionId AND v.voteType = 'LIKE'")
    long countLikes(Long competitionId);

    @Query("SELECT COUNT(v) FROM CompetitionVote v WHERE v.competitionId = :competitionId AND v.voteType = 'DISLIKE'")
    long countDislikes(Long competitionId);
}
