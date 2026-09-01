# Profiles

Profiles add optional personal details to the existing manager pages without
turning Gauntlet into a social network or league-management system.

## Ownership

- Clerk owns authentication, sessions, names used to prefill onboarding, and
  uploaded profile images.
- Postgres owns personal profile fields and the link from a Clerk user to a Sleeper
  identity.
- Sleeper owns current league, roster, owner, and co-owner relationships.

## Invariants

1. A Clerk user has at most one profile.
2. A Sleeper user can be claimed by at most one profile.
3. A roster can be referenced by multiple profiles so co-managers remain
   first-class people.
4. The browser never chooses the profile owner. Mutations derive `clerkUserId`
   from Clerk's server session.
5. A Sleeper identity key is valid only when its league, roster, and user still
   appear together in the current registered leagues.
6. Each league is resolved independently before profile options are combined.
7. Personal details are loaded only for signed-in viewers; public manager
   history remains available without them.

## Module Shape

- `team-options.ts` resolves current Sleeper identities.
- `validation.ts` owns the input boundary.
- `service.ts` enforces claim rules.
- `repository.ts` is the only profile database boundary.
- `manager-profiles.ts` joins application profiles to Clerk images and current
  Sleeper labels, keyed by Sleeper user ID for the existing manager routes.
- `components/` contains the shared onboarding/edit form and personal-details
  presentation.

Authorization lives at the data boundaries: manager routes fetch personal
details only when a Clerk session exists, profile-editing pages call
`requireUserId`, and `/api/profile` rejects requests without a Clerk session.
The existing analytics and manager history remain public.
