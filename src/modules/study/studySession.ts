import { compareAsc, isAfter } from 'date-fns'

import { RevisionLogModel } from '../../mongo'
import { FlashcardStatus } from '../../mongo/Note'
import type { RevisionLogDocument } from '../../mongo/RevisionLog'
import { endOfUserDay, startOfUserDay } from '../../utils/date'

const sumByStatus = (logs: RevisionLogDocument[], status: FlashcardStatus) => {
  return logs.reduce(
    (total, log) => (log.status === status ? total + 1 : total),
    0
  )
}

export const studyFlashcardsByDeck = async (deckId: string, ctx: Context) => {
  const userTimeZone = ctx.user?.preferences?.zoneInfo ?? 'UTC'

  const deck = await ctx.deckLoader.load(deckId)

  const studyLimitByStatus = {
    [FlashcardStatus.NEW]: deck.configuration.new.perDay,
    [FlashcardStatus.REVIEW]: deck.configuration.review.perDay,
  }

  const startDate = startOfUserDay(userTimeZone)
  const endDate = endOfUserDay(userTimeZone)

  const todayLogs = await RevisionLogModel.find({
    deckId,
    createdAt: { $gte: startDate, $lte: endDate },
  })

  const flashcardLogByFlashcardId = new Map<string, RevisionLogDocument>()

  todayLogs.forEach((revisionLog) => {
    if (flashcardLogByFlashcardId.has(revisionLog.flashCardId.toString())) {
      return
    }

    flashcardLogByFlashcardId.set(
      revisionLog.flashCardId.toString(),
      revisionLog
    )
  })

  const todayLogsByDistinctFlashcards = Array.from(
    flashcardLogByFlashcardId.values()
  )

  const numOfNew = sumByStatus(
    todayLogsByDistinctFlashcards,
    FlashcardStatus.NEW
  )
  const numOfReview = sumByStatus(
    todayLogsByDistinctFlashcards,
    FlashcardStatus.REVIEW
  )

  const flashcardCounts = {
    [FlashcardStatus.NEW]: numOfNew,
    [FlashcardStatus.REVIEW]: numOfReview,
  }

  const flashcards = (await ctx.flashcardsByDeckLoader.load(deckId))
    .filter((flashcard) => {
      const studiedToday = flashcardLogByFlashcardId.has(
        flashcard._id.toString()
      )

      if (flashcard.due && isAfter(flashcard.due, endDate)) {
        return false
      }

      const totalOfStudiedUntilNow =
        flashcard.status === FlashcardStatus.LEARNING ||
        flashcard.status === FlashcardStatus.RELEARNING
          ? 0
          : flashcardCounts[flashcard.status]

      const maxPerDay =
        flashcard.status === FlashcardStatus.LEARNING ||
        flashcard.status === FlashcardStatus.RELEARNING
          ? 0
          : studyLimitByStatus[flashcard.status]

      if (
        studiedToday ||
        flashcard.status === FlashcardStatus.LEARNING ||
        flashcard.status === FlashcardStatus.RELEARNING
      ) {
        return true
      } else if (totalOfStudiedUntilNow < maxPerDay) {
        flashcardCounts[flashcard.status]++
        return true
      }

      return false
    })
    .sort((a, b) => {
      if (!a.due && !b.due) {
        return a.flashcardIndex - b.flashcardIndex
      }

      if (!a.due) {
        return -1
      }

      if (!b.due) {
        return 1
      }

      return compareAsc(a.due, b.due)
    })

  return flashcards
}
