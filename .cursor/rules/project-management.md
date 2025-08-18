---
alwaysApply: true
---

# The Gauntlet - Project Management & Development Discipline

This file enforces development discipline and project management within Cursor to ensure ordered, efficient development.

## 🎯 PROJECT OVERVIEW

```rule
You are developing **The Gauntlet**, a fantasy football platform with:
- 2 leagues of 12 teams each (3 divisions per league)
- 6-team playoffs with promotion/relegation between leagues
- Advanced analytics powered by Monte Carlo simulations
- Real-time win probabilities and comprehensive league management
```

## 📋 TODO MANAGEMENT SYSTEM

```rule
CRITICAL: Before any coding work, you MUST:
1. Read `/apps/web/src/app/todos/page.tsx` to understand current TODO state
2. Validate order: Ensure dependencies are completed before starting new work  
3. Single focus: Each chat session should focus on ONE TODO item only
4. Update progress: Mark TODOs as in_progress → completed using todo_write tool
```

## 🚦 DEVELOPMENT PHASES (MUST FOLLOW ORDER)

```rule
### Phase 1: Foundation 🏗️ (CURRENT PRIORITY)
**Status**: Active - Focus here first
**Critical Path Items**:
1. `fix-light-dark-mode` - ✅ COMPLETED
2. `mobile-responsiveness` - ✅ COMPLETED 
3. `github-actions-data-fetch` - Automated data pipeline setup 🤖 HIGH
4. `chart-color-palette-iteration` - Theme-aware chart colors 🎨 MEDIUM

### Phase 2: Core Analytics 📊
**Status**: Blocked until Phase 1 complete
**Key Items**:
- `connect-sims-engine` - Integrate Monte Carlo simulation engine
- `data-strategy-optimization` - Smart update scheduling (10min/12hr)
- `fix-playoffs-ui` - 6-team playoff bracket with toilet bowl

### Phase 3: Advanced Features 🎯
**Status**: Blocked until Phase 2 complete  
- Draft analysis, transaction grades, luck ratings

### Phase 4: Gauntlet-Specific 🏆
**Status**: Final phase
- Division structure, competition overview, promotion/relegation
```

## ⚠️ PRE-DEVELOPMENT VALIDATION

```rule
Before starting ANY TODO item, you MUST verify:

### 1. Dependency Check ✅
REQUIRED: Check that ALL dependency TODOs are completed
- Read TODO specifications in modal system
- Verify prerequisite phases are finished
- Confirm no blockers remain

### 2. Requirements Understanding 📖
REQUIRED: Demonstrate understanding of:
- Technical requirements list
- Data models involved  
- API endpoints needed
- Acceptance criteria
- Estimated complexity

### 3. Scope Validation 🎯
REQUIRED: Confirm this session will:
- Focus on exactly ONE TODO item
- Complete the entire TODO (not partial work)
- Update TODO status appropriately
```

## 🔧 TECHNICAL SPECIFICATIONS

```rule
### Database & APIs
- **Database**: Neon PostgreSQL with Prisma ORM
- **API Limits**: <1000 Sleeper API calls per minute
- **Update Strategy**: 10min during NFL games, 12hr during week
- **Deployment**: Vercel with DATABASE_URL environment variable

### League Structure (The Gauntlet Specific)
- **Format**: 2 leagues × 12 teams × 3 divisions
- **Playoffs**: 6-team with 2 byes, reseeding, toilet bowl
- **Promotion/Relegation**: Playoff teams promoted, non-playoff relegated
- **Initial Assignment**: Random distribution

### UI/UX Requirements  
- **Themes**: Distinct color palettes for light/dark modes ✅ COMPLETED
- **Mobile**: Mobile-first responsive design enforced by cursor rules ✅ COMPLETED
- **Brand**: Use brand color palette as foundation
- **Accessibility**: WCAG AA compliance required
```

## 📈 PROGRESS TRACKING PROTOCOL

```rule
### Starting Work:
1. Read current TODO specifications from the modal system
2. Mark TODO as `in_progress` using todo_write tool
3. State dependencies verified and requirements understood
4. Confirm single-TODO focus for this session

### During Work:
- Implement according to technical requirements
- Test against acceptance criteria
- Follow existing code patterns and architecture

### Completing Work:
1. Verify ALL acceptance criteria met
2. Test functionality thoroughly  
3. Mark TODO as `completed` using todo_write tool
4. Deploy to Vercel using `vercel --prod` from project root (if needed)
5. Suggest next logical TODO based on phase order
```

## 🚨 VIOLATIONS & ENFORCEMENT

```rule
### FORBIDDEN Actions:
❌ Starting work without dependency verification  
❌ Working on multiple TODOs in one session
❌ Skipping phases or jumping ahead in priority
❌ Not updating TODO status
❌ Partial implementations that don't meet acceptance criteria

### REQUIRED Actions:
✅ Always check TODO page before coding
✅ Verify all dependencies completed  
✅ Update TODO status at start and completion
✅ Follow technical specifications exactly
✅ Test against acceptance criteria
✅ Maintain single TODO focus
```

## 🎯 SESSION START CHECKLIST

```rule
Before any development work, complete this checklist:

[ ] Read current TODO specifications
[ ] Identify which TODO to work on
[ ] Verify all dependencies are completed
[ ] Confirm TODO fits current development phase  
[ ] Mark TODO as in_progress
[ ] State understanding of requirements
[ ] Confirm single-TODO session scope
```

## 📊 CURRENT STATUS REFERENCE

```rule
**Active Phase**: Phase 1 - Foundation (2/4 critical items completed)
**Next TODO**: `chart-color-palette-iteration` or `github-actions-data-fetch` 
**Current Focus**: Complete foundation phase before moving to analytics
**Recent Completions**: ✅ Theme system, ✅ Mobile responsiveness + enforced rules
```

## 🔄 INTEGRATION WITH EXISTING RULES

```rule
This project management system integrates with:
- `technical-overview.md` for architecture and coding standards
- `general.md` for agent behavior and testing requirements
- `mobile-responsiveness.md` for enforced mobile-first development
- `animations.md` for UI/UX specifications
- `theming-guidelines.md` for color and theme consistency

Always reference technical-overview.md for implementation details after validating TODO requirements here.
All new UI work must also comply with mobile-responsiveness.md standards.
```

## 🔄 CONTINUOUS IMPROVEMENT

```rule
This rules file should be updated when:
- Phases are completed
- New TODOs are added
- Requirements change  
- Development priorities shift

The TODO page serves as the dynamic source of truth for current work items.
```

---

**Remember**: This embedded project management system ensures efficient, ordered development. Following these rules prevents technical debt and ensures all work contributes to the overall project vision.
