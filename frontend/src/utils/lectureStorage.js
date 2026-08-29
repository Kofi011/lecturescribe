/**
 * utils/lectureStorage.js — Dual Persistence: PostgreSQL Cloud Backend + Local Storage Fallback
 */

const STORAGE_KEY = 'lecturescribe_saved_lectures_v1'
import { API_URL } from '../config'

export const SAMPLE_LECTURE = {
  id: 'sample_cs101_sorting',
  isSample: true,
  title: 'Introduction to Sorting Algorithms & Computational Complexity',
  date: new Date().toISOString(),
  durationSec: 142,
  fileName: 'cs101_sorting_lecture.mp3',
  overview:
    'This lecture explores fundamental comparison-based sorting algorithms in computer science, contrasting quadratic time approaches like Bubble Sort with divide-and-conquer strategies like Quick Sort, while analyzing time-space trade-offs and algorithmic stability in production systems.',
  key_concepts: [
    {
      concept: 'Algorithmic Complexity & Big-O',
      explanation: 'A formal mathematical notation describing the asymptotic upper bound of execution time or memory utilization as the input size n grows towards infinity.',
    },
    {
      concept: 'Bubble Sort (Comparison Swap)',
      explanation: 'A naive sorting technique that iteratively steps through a list, comparing adjacent elements and swapping them if they are in the wrong order until no swaps are needed.',
    },
    {
      concept: 'Quick Sort (Divide & Conquer)',
      explanation: 'An efficient recursive partitioning algorithm that selects a pivot element and divides the array into sub-arrays of elements less than and greater than the pivot.',
    },
    {
      concept: 'Algorithmic Stability',
      explanation: 'A sorting algorithm is stable if two items with equal keys appear in the same relative order in the sorted output as they appeared in the initial input.',
    },
  ],
  main_arguments: [
    'No single sorting algorithm is universally optimal; selection depends on data size, existing sortedness, and memory limits.',
    'Quick Sort is substantially faster in practice due to favorable cache locality and an average time complexity of O(n log n).',
    'Bubble Sort serves primarily educational purposes because its quadratic O(n²) average and worst-case performance does not scale to large datasets.',
    'Recursion depth in Quick Sort incurs an O(log n) auxiliary stack space cost that must be accounted for in constrained environments.',
  ],
  important_terms: [
    {
      term: 'Time Complexity',
      definition: 'The computational complexity that quantifies the amount of computer time taken to run an algorithm.',
    },
    {
      term: 'Pivot Element',
      definition: 'The reference element chosen in Quick Sort around which the remaining elements are partitioned.',
    },
    {
      term: 'In-Place Sorting',
      definition: 'An algorithm that transforms input data without using significant auxiliary data structures (typically O(1) extra space).',
    },
    {
      term: 'Worst-Case Degradation',
      definition: 'The scenario where an algorithm exhibits its slowest performance (e.g. Quick Sort on an already sorted list with naive pivot choice becoming O(n²)).',
    },
  ],
  study_notes: [
    {
      heading: '1. Foundations of Comparison Sorting',
      points: [
        'Sorting arranges records according to a predetermined ordering key.',
        'Comparison-based algorithms have a theoretical lower bound of Ω(n log n) in the worst case.',
        'Key performance indicators: best-case, average-case, worst-case time, and memory overhead.',
      ],
    },
    {
      heading: '2. Bubble Sort Analysis',
      points: [
        'Mechanism: Compares adjacent elements (arr[i], arr[i+1]) and swaps if arr[i] > arr[i+1].',
        'Pass count: Requires up to n-1 passes over an array of length n.',
        'Optimization: An early-exit flag can stop iterations if a full pass occurs with zero swaps, giving O(n) best-case.',
        'Space overhead: O(1) auxiliary memory because swaps occur in-place.',
      ],
    },
    {
      heading: '3. Quick Sort Mechanics & Partitioning',
      points: [
        'Three-step pattern: Choose Pivot -> Partition array around Pivot -> Recursively sort partitions.',
        'Average-case time: O(n log n) with very small constant factors.',
        'Pivot selection strategies: first element, last element, median-of-three, or random selection.',
        'Stack space: O(log n) average auxiliary memory on the call stack.',
      ],
    },
    {
      heading: '4. Decision Framework for Engineers',
      points: [
        'Use Quick Sort for general in-memory large data processing.',
        'Avoid Bubble Sort in production; use Insertion Sort if input is nearly sorted or very small (n < 16).',
        'Consider Merge Sort when guaranteed O(n log n) worst-case and stability are mandatory.',
      ],
    },
  ],
  key_takeaways: [
    'Bubble Sort is an intuitive O(n²) algorithm suited solely for instructional demos or tiny nearly-sorted lists.',
    'Quick Sort is an industry workhorse offering O(n log n) average speed via divide-and-conquer partitioning.',
    'Careful pivot selection (e.g., median-of-three) prevents Quick Sort from degrading into quadratic worst-case.',
    'Always evaluate algorithm choice against hardware memory constraints, cache locality, and data distributions.',
  ],
  revision_questions: [
    {
      question: 'Why is Quick Sort generally preferred over Bubble Sort for large datasets?',
      answer: 'Quick Sort splits the workload logarithmically using divide-and-conquer, yielding an average O(n log n) time complexity compared to Bubble Sort\'s slow O(n²) quadratic comparisons.',
    },
    {
      question: 'What happens to naive Quick Sort when executed on an already sorted array?',
      answer: 'If the first or last element is naively picked as the pivot, partitions become completely unbalanced (1 element vs n-1 elements), causing time complexity to degrade to O(n²).',
    },
    {
      question: 'What is the auxiliary space complexity of Bubble Sort versus Quick Sort?',
      answer: 'Bubble Sort requires O(1) constant auxiliary space. Quick Sort requires O(log n) average stack space for recursive sub-array partition calls.',
    },
    {
      question: 'What is an early-exit optimization in Bubble Sort?',
      answer: 'Tracking whether any swaps occurred during a full pass. If no swaps happened, the array is already sorted and the algorithm terminates immediately in O(n) time.',
    },
  ],
  transcript: `Welcome to Introduction to Computer Science. Today we discuss sorting algorithms and computational complexity. 

Sorting is one of the most fundamental operations in software engineering. When we analyze sorting, we examine both time complexity—how long the algorithm takes to execute—and space complexity—how much extra memory it demands.

First, let's examine Bubble Sort. Bubble Sort is a comparison-based algorithm that steps through an array, comparing adjacent elements and swapping them if they are in the wrong order. On average and in the worst case, Bubble Sort takes O of n squared time because every element must be compared against every other element across multiple passes. While it is simple to implement and uses O(1) extra space, it becomes completely impractical for large datasets.

Next, we look at Quick Sort. Quick Sort utilizes a divide-and-conquer paradigm. It begins by selecting a pivot element from the array. It then partitions all other elements into two groups: those smaller than the pivot and those larger. Quick Sort recursively repeats this process on the left and right sub-arrays. On average, Quick Sort operates in O of n log n time, which is exponentially faster than Bubble Sort for large data. However, if pivot selection is poor, such as choosing the first element of an already sorted list, its worst-case can degrade to O of n squared.

In conclusion, your choice of algorithm depends on input size, memory constraints, and stability requirements. Thank you.`,
  notes_markdown: `# Introduction to Sorting Algorithms & Computational Complexity

## Overview
This lecture explores fundamental comparison-based sorting algorithms in computer science, contrasting quadratic time approaches like Bubble Sort with divide-and-conquer strategies like Quick Sort, while analyzing time-space trade-offs and algorithmic stability in production systems.

## Key Concepts
- **Algorithmic Complexity & Big-O**: A formal mathematical notation describing the asymptotic upper bound of execution time or memory utilization as the input size n grows towards infinity.
- **Bubble Sort (Comparison Swap)**: A naive sorting technique that iteratively steps through a list, comparing adjacent elements and swapping them if they are in the wrong order until no swaps are needed.
- **Quick Sort (Divide & Conquer)**: An efficient recursive partitioning algorithm that selects a pivot element and divides the array into sub-arrays of elements less than and greater than the pivot.
- **Algorithmic Stability**: A sorting algorithm is stable if two items with equal keys appear in the same relative order in the sorted output as they appeared in the initial input.

## Main Arguments & Ideas
- No single sorting algorithm is universally optimal; selection depends on data size, existing sortedness, and memory limits.
- Quick Sort is substantially faster in practice due to favorable cache locality and an average time complexity of O(n log n).
- Bubble Sort serves primarily educational purposes because its quadratic O(n²) average and worst-case performance does not scale to large datasets.
- Recursion depth in Quick Sort incurs an O(log n) auxiliary stack space cost that must be accounted for in constrained environments.

## Important Terms
- **Time Complexity**: The computational complexity that quantifies the amount of computer time taken to run an algorithm.
- **Pivot Element**: The reference element chosen in Quick Sort around which the remaining elements are partitioned.
- **In-Place Sorting**: An algorithm that transforms input data without using significant auxiliary data structures (typically O(1) extra space).
- **Worst-Case Degradation**: The scenario where an algorithm exhibits its slowest performance (e.g. Quick Sort on an already sorted list with naive pivot choice becoming O(n²)).

## Study Notes
### 1. Foundations of Comparison Sorting
- Sorting arranges records according to a predetermined ordering key.
- Comparison-based algorithms have a theoretical lower bound of Ω(n log n) in the worst case.
- Key performance indicators: best-case, average-case, worst-case time, and memory overhead.

### 2. Bubble Sort Analysis
- Mechanism: Compares adjacent elements (arr[i], arr[i+1]) and swaps if arr[i] > arr[i+1].
- Pass count: Requires up to n-1 passes over an array of length n.
- Optimization: An early-exit flag can stop iterations if a full pass occurs with zero swaps, giving O(n) best-case.
- Space overhead: O(1) auxiliary memory because swaps occur in-place.

### 3. Quick Sort Mechanics & Partitioning
- Three-step pattern: Choose Pivot -> Partition array around Pivot -> Recursively sort partitions.
- Average-case time: O(n log n) with very small constant factors.
- Pivot selection strategies: first element, last element, median-of-three, or random selection.
- Stack space: O(log n) average auxiliary memory on the call stack.

### 4. Decision Framework for Engineers
- Use Quick Sort for general in-memory large data processing.
- Avoid Bubble Sort in production; use Insertion Sort if input is nearly sorted or very small (n < 16).
- Consider Merge Sort when guaranteed O(n log n) worst-case and stability are mandatory.

## Key Takeaways
- Bubble Sort is an intuitive O(n²) algorithm suited solely for instructional demos or tiny nearly-sorted lists.
- Quick Sort is an industry workhorse offering O(n log n) average speed via divide-and-conquer partitioning.
- Careful pivot selection (e.g., median-of-three) prevents Quick Sort from degrading into quadratic worst-case.
- Always evaluate algorithm choice against hardware memory constraints, cache locality, and data distributions.

## Questions for Revision
**Q1: Why is Quick Sort generally preferred over Bubble Sort for large datasets?**
- *Answer*: Quick Sort splits the workload logarithmically using divide-and-conquer, yielding an average O(n log n) time complexity compared to Bubble Sort's slow O(n²) quadratic comparisons.

**Q2: What happens to naive Quick Sort when executed on an already sorted array?**
- *Answer*: If the first or last element is naively picked as the pivot, partitions become completely unbalanced (1 element vs n-1 elements), causing time complexity to degrade to O(n²).

**Q3: What is the auxiliary space complexity of Bubble Sort versus Quick Sort?**
- *Answer*: Bubble Sort requires O(1) constant auxiliary space. Quick Sort requires O(log n) average stack space for recursive sub-array partition calls.

**Q4: What is an early-exit optimization in Bubble Sort?**
- *Answer*: Tracking whether any swaps occurred during a full pass. If no swaps happened, the array is already sorted and the algorithm terminates immediately in O(n) time.`,
}

export function getSavedLectures() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw === null) {
      // First visit initialization
      const initial = [SAMPLE_LECTURE]
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(initial))
      } catch {}
      return initial
    }
    const list = JSON.parse(raw)
    return Array.isArray(list) ? list : []
  } catch {
    return []
  }
}

/**
 * Fetch server lectures for the authenticated user and sync into local state.
 */
export async function syncServerLectures() {
  try {
    const endpoint = API_URL ? `${API_URL}/api/lectures` : '/api/lectures'
    const res = await fetch(endpoint, { credentials: 'include' })
    if (res.ok) {
      const data = await res.json()
      if (Array.isArray(data?.lectures)) {
        const localList = getSavedLectures().filter((l) => l.isSample)
        const combined = [...data.lectures, ...localList]
        localStorage.setItem(STORAGE_KEY, JSON.stringify(combined))
        window.dispatchEvent(new Event('lecturescribe_storage_update'))
        return combined
      }
    }
  } catch (err) {
    console.warn('[lecture storage] server sync error:', err)
  }
  return getSavedLectures()
}

export function saveLecture(lecture, currentUser = null) {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    let list = []
    if (raw) {
      try {
        list = JSON.parse(raw)
      } catch {}
    }
    if (!Array.isArray(list)) list = []
    const existing = list.filter((l) => l.id !== lecture.id)
    const updated = [lecture, ...existing]
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
    window.dispatchEvent(new Event('lecturescribe_storage_update'))

    // If user is authenticated and this is not a sample, also sync to backend if needed
    if (currentUser && !lecture.isSample) {
      const endpoint = API_URL ? `${API_URL}/api/lectures` : '/api/lectures'
      fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(lecture),
        credentials: 'include',
      }).catch((e) => console.warn('[lecture storage] server save error:', e))
    }

    return updated
  } catch (e) {
    console.warn('Failed to save lecture to localStorage:', e)
    return [lecture]
  }
}

export async function saveTutorHistory(lectureId, history, currentUser = null) {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const list = JSON.parse(raw)
      const idx = list.findIndex((l) => l.id === lectureId)
      if (idx !== -1) {
        list[idx].tutor_history = history
        localStorage.setItem(STORAGE_KEY, JSON.stringify(list))
        window.dispatchEvent(new Event('lecturescribe_storage_update'))
      }
    }

    if (currentUser && lectureId && !lectureId.startsWith('sample_')) {
      const endpoint = API_URL ? `${API_URL}/api/lectures/${lectureId}/tutor` : `/api/lectures/${lectureId}/tutor`
      await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ history }),
        credentials: 'include',
      })
    }
  } catch (err) {
    console.warn('[tutor storage] save error:', err)
  }
}

export function deleteLecture(lectureId, currentUser = null) {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    let list = []
    if (raw) {
      try {
        list = JSON.parse(raw)
      } catch {}
    }
    if (!Array.isArray(list)) list = []
    const updated = list.filter((l) => l.id !== lectureId)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
    window.dispatchEvent(new Event('lecturescribe_storage_update'))

    if (currentUser && lectureId && !lectureId.startsWith('sample_')) {
      const endpoint = API_URL ? `${API_URL}/api/lectures/${lectureId}` : `/api/lectures/${lectureId}`
      fetch(endpoint, { method: 'DELETE', credentials: 'include' }).catch((e) =>
        console.warn('[lecture storage] server delete error:', e)
      )
    }

    return updated
  } catch (e) {
    console.warn('Failed to delete lecture:', e)
    return []
  }
}

export function clearAllLectures() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([]))
    window.dispatchEvent(new Event('lecturescribe_storage_update'))
    return []
  } catch (e) {
    console.warn('Failed to clear lectures:', e)
    return []
  }
}
