# Security Specification — Perkhemahan Kokurikulum SK Lupak 2026

## 1. Data Invariants
1. **Authentication & Verification Gate**: Every read or write operation requires a signed-in user (`request.auth != null`) with a verified email (`request.auth.token.email_verified == true`) or bootstrapped administrator email (`eil040711@gmail.com`).
2. **Path Variable Hardening**: Every document ID (`{campId}`, `{logId}`) must match `^[a-zA-Z0-9_\-]+$` with length between 1 and 128 characters.
3. **Strict Schema Keys & Anti-Shadow Fields**:
   - `CampWorkspace` (`/campWorkspaces/{campId}`) must contain exact required keys `['campId', 'ownerId', 'updatedByUid', 'updatedByName', 'lastAction', 'exploraceScores', 'ikhtiarScores', 'kawadScores', 'schedule', 'stations', 'ajkList', 'awards', 'oprMeta', 'createdAt', 'updatedAt']` and no extra keys.
   - `SyncLogEntry` (`/campWorkspaces/{campId}/syncLogs/{logId}`) must contain exact required keys `['logId', 'campId', 'ownerId', 'actor', 'description', 'timestampLabel', 'createdAt']` and no extra keys.
4. **Master Gate (Subcollection Relational Sync)**:
   - A `SyncLogEntry` in `/campWorkspaces/{campId}/syncLogs/{logId}` can only be accessed or created if the parent `/campWorkspaces/{campId}` document exists.
5. **Identity & Immutability Integrity**:
   - On creation of `CampWorkspace`, `ownerId` and `updatedByUid` must equal `request.auth.uid`, and `campId` must match the path `{campId}`.
   - On update of `CampWorkspace`, `ownerId`, `campId`, and `createdAt` are strictly immutable, while `updatedByUid` must equal `request.auth.uid` and `updatedAt` must equal `request.time`.
   - `SyncLogEntry` documents are append-only audit logs (`update` and `delete` are forbidden).
6. **Temporal Integrity**:
   - `createdAt == request.time` on `create`.
   - `updatedAt == request.time` on `create` and `update`.

## 2. The "Dirty Dozen" Payloads

1. **Payload 1 (Unauthenticated Write)**: `auth = null` attempting to write to `/campWorkspaces/sk_lupak_2026`.
2. **Payload 2 (Unverified Email Spoof)**: `auth = { uid: 'u1', token: { email: 'eil040711@gmail.com', email_verified: false } }` attempting to create `/campWorkspaces/sk_lupak_2026`.
3. **Payload 3 (Owner Spoofing on Create)**: Authenticated user `'u1'` setting `ownerId: 'u2'` on `/campWorkspaces/sk_lupak_2026`.
4. **Payload 4 (Path ID Mismatch)**: Creating `/campWorkspaces/sk_lupak_2026` with body `campId: 'other_id'`.
5. **Payload 5 (Shadow/Ghost Field Injection)**: Updating `/campWorkspaces/sk_lupak_2026` with an undeclared field `isAdmin: true`.
6. **Payload 6 (Immutable Field Mutation)**: Updating `/campWorkspaces/sk_lupak_2026` to change `ownerId` or `createdAt`.
7. **Payload 7 (Forged Client Timestamp)**: Creating `/campWorkspaces/sk_lupak_2026` with a past/future `createdAt` instead of `request.time`.
8. **Payload 8 (Oversized String Denial-of-Wallet)**: Creating `/campWorkspaces/sk_lupak_2026` with `lastAction` exceeding 300 characters.
9. **Payload 9 (Unbounded Array Injection)**: Updating `/campWorkspaces/sk_lupak_2026` with `stations` array of 50 items (exceeding max 20).
10. **Payload 10 (Orphaned Subcollection Write)**: Creating `/campWorkspaces/non_existent/syncLogs/log_1` when parent `/campWorkspaces/non_existent` does not exist.
11. **Payload 11 (Audit Log Tampering)**: Attempting to `update` or `delete` an existing `/campWorkspaces/sk_lupak_2026/syncLogs/log_1` document.
12. **Payload 12 (Invalid Document ID Poisoning)**: Creating `/campWorkspaces/invalid$id!@#` with disallowed special characters.
