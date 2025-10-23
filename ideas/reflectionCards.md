# Reflection cards

- categories [x]
- questions [x]
- [ ] UI/UX

## Userflow

### First interaction

1. Introduction to the tool
   - Warning to not overdo it. "Medicine is larger doses can become poison"
   - Recommend to do not more than 2-3 reflections per sitting.
   - Self-reflection is cognitavly draining and the depth of reflection get less the more we do in one session.
2. Present the five domains that will be covered
3. Let the user choose a domain with which they would like to get started
   - inform them that they can switch domains at any time
   - recommend to stay in one domain till the end to avoid context switching
4. Choosing a domain navigates the user to the first question of the domain
   - from here the user can navigate back to either the domain overview or the tool overview
   - add the option to skip a question and pick it up later

### Finishing a question

1. Once the user clicks "finish reflection" rather than "go deeper", the tool summarizes the user's reflection.
2. The user get's the option to change the summary to their liking.
3. Once the summary is finished they user is congratulated for finishing a question and navigated to the domain overview, where the next card with a question is added.
4.

### Domain overview

1. Display n+1 cards (where n is the number of finished or skipped questions).
2. The new card is displaying the question and either a "start reflection" or "continue reflection" button.
3. Finished cards display a one sentence summary.
4. Clicking on a finished cards get's the user to the summary overview. There they can get back to the chat and continue reflection at any time.

### Any consequent interaction

1. If the user hasn't finished the introduction, start the introduction.
2. If the user has an unfinalized question in the currently active domain, open this question.
3. If the user has finished a question in a domain, open the domain overview.
