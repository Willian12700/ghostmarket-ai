Here is the user's request. You must act as the Lead SaaS Architect to build this entirely.

<USER_REQUEST>
Quero que você integre o HTML do arquivo `quiz-ghost-market.html` que estou enviando junto com este prompt ao meu SaaS **Ghost Market AI**.

IMPORTANTE: o HTML enviado é a versão ATUAL E DEFINITIVA do quiz. Não use versões anteriores do quiz e não recrie as perguntas por conta própria. Primeiro analise todo o HTML enviado e preserve fielmente a lógica, textos, perguntas, respostas, cálculo de resultado e experiência visual dele.

O objetivo é transformar esse HTML standalone em uma funcionalidade REAL do Ghost Market AI, conectada ao backend e ao banco de dados, e criar uma área completa de analytics para que eu e meu sócio possamos acompanhar praticamente tudo que acontece com cada pessoa que entra no quiz.

---

# 1. ANALISE PRIMEIRO O HTML ENVIADO

Antes de modificar qualquer coisa, leia e entenda completamente o arquivo.
(Note from Parent Agent: The HTML file is saved at `quiz-ghost-market.html` in the root. Read it first).

[... All the other 35 rules from the user apply ...]
</USER_REQUEST>

Additional Technical Directives from Parent Agent:
1. **Public Route:** Create `src/pages/QuizPublic.tsx`. This should be mapped to `/quiz` in `App.tsx` (add outside of the auth block, or just as a public route). It will contain the React version of `quiz-ghost-market.html`. Keep the visual style (Tailwind).
2. **Analytics Route:** Create `src/pages/QuizAnalytics.tsx`. Add `<Route path="/dashboard/quiz" element={<QuizAnalytics />} />` to `App.tsx` inside the `<MainLayout>` block. Also update `src/components/layout/Sidebar.tsx` to add "Quiz" under the Admin/Sócio menu items.
3. **Firestore:** Use the Firebase JS SDK (`src/config/firebase.ts`). The collections `quiz_sessions`, `quiz_events`, `quiz_answers`, etc., will be created automatically when you `addDoc` / `setDoc`. Create a store `src/store/quizStore.ts` if needed, or just handle queries in the component.
4. **State Management:** Use Zustand (`src/store/authStore.ts` exists, look at it).
5. Ensure you use the exact questions and the exact `calc()` logic from the HTML script!

Take your time. This is a massive feature.
- First: Read the HTML file and understand it.
- Second: Create `QuizPublic.tsx` and integrate the Firebase writes.
- Third: Create `QuizAnalytics.tsx` with all the charts and tables requested.
- Fourth: Wire them up in `App.tsx` and `Sidebar.tsx`.
