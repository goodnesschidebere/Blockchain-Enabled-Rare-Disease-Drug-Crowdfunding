(define-constant ERR-NOT-AUTHORIZED u100)
(define-constant ERR-INVALID-DISEASE-NAME u101)
(define-constant ERR-INVALID-FUNDING-GOAL u102)
(define-constant ERR-INVALID-MILESTONES u103)
(define-constant ERR-INVALID-DESCRIPTION u104)
(define-constant ERR-INVALID-START-TIME u105)
(define-constant ERR-INVALID-END-TIME u106)
(define-constant ERR-CAMPAIGN-ALREADY-EXISTS u107)
(define-constant ERR-CAMPAIGN-NOT-FOUND u108)
(define-constant ERR-INVALID-STATUS u109)
(define-constant ERR-INVALID-MIN-DONATION u110)
(define-constant ERR-INVALID-MAX-DONORS u111)
(define-constant ERR-UPDATE-NOT-ALLOWED u112)
(define-constant ERR-INVALID-UPDATE-PARAM u113)
(define-constant ERR-MAX-CAMPAIGNS-EXCEEDED u114)
(define-constant ERR-INVALID-CATEGORY u115)
(define-constant ERR-INVALID-TARGET-AUDIENCE u116)
(define-constant ERR-INVALID-LOCATION u117)
(define-constant ERR-INVALID-CURRENCY u118)
(define-constant ERR-INVALID-ORACLE u119)
(define-constant ERR-AUTHORITY-NOT-VERIFIED u120)
(define-constant ERR-INVALID-REWARD-TIER u121)
(define-constant ERR-INVALID-PROPOSAL-ID u122)
(define-constant ERR-INVALID-VOTING-PERIOD u123)
(define-constant ERR-INVALID-QUORUM u124)
(define-constant ERR-INVALID-PROGRESS u125)
(define-data-var next-campaign-id uint u0)
(define-data-var max-campaigns uint u10000)
(define-data-var creation-fee uint u500)
(define-data-var authority-contract (optional principal) none)
(define-map campaigns
  uint
  {
    creator: principal,
    disease-name: (string-ascii 100),
    funding-goal: uint,
    funds-raised: uint,
    milestones: (list 20 { description: (string-ascii 200), amount: uint, achieved: bool }),
    description: (string-ascii 500),
    start-time: uint,
    end-time: uint,
    status: (string-ascii 20),
    min-donation: uint,
    max-donors: uint,
    category: (string-ascii 50),
    target-audience: (string-ascii 100),
    location: (string-ascii 100),
    currency: (string-ascii 20),
    oracle: principal,
    reward-tiers: (list 10 { min-amount: uint, nft-type: (string-ascii 50) }),
    proposal-id: uint,
    voting-period: uint,
    quorum: uint,
    progress: uint
  }
)
(define-map campaigns-by-name
  (string-ascii 100)
  uint)
(define-map campaign-updates
  uint
  {
    update-disease-name: (string-ascii 100),
    update-funding-goal: uint,
    update-description: (string-ascii 500),
    update-timestamp: uint,
    updater: principal
  }
)
(define-read-only (get-campaign (id uint))
  (map-get? campaigns id)
)
(define-read-only (get-campaign-updates (id uint))
  (map-get? campaign-updates id)
)
(define-read-only (is-campaign-registered (name (string-ascii 100)))
  (is-some (map-get? campaigns-by-name name))
)
(define-private (validate-disease-name (name (string-ascii 100)))
  (if (and (> (len name) u0) (<= (len name) u100))
      (ok true)
      (err ERR-INVALID-DISEASE-NAME))
)
(define-private (validate-funding-goal (goal uint))
  (if (> goal u0)
      (ok true)
      (err ERR-INVALID-FUNDING-GOAL))
)
(define-private (validate-milestones (milestones (list 20 { description: (string-ascii 200), amount: uint, achieved: bool })))
  (if (and (> (len milestones) u0) (<= (len milestones) u20))
      (ok true)
      (err ERR-INVALID-MILESTONES))
)
(define-private (validate-description (desc (string-ascii 500)))
  (if (<= (len desc) u500)
      (ok true)
      (err ERR-INVALID-DESCRIPTION))
)
(define-private (validate-start-time (start uint))
  (if (>= start block-height)
      (ok true)
      (err ERR-INVALID-START-TIME))
)
(define-private (validate-end-time (end uint) (start uint))
  (if (> end start)
      (ok true)
      (err ERR-INVALID-END-TIME))
)
(define-private (validate-status (status (string-ascii 20)))
  (if (or (is-eq status "active") (is-eq status "completed") (is-eq status "failed"))
      (ok true)
      (err ERR-INVALID-STATUS))
)
(define-private (validate-min-donation (min uint))
  (if (> min u0)
      (ok true)
      (err ERR-INVALID-MIN-DONATION))
)
(define-private (validate-max-donors (max uint))
  (if (> max u0)
      (ok true)
      (err ERR-INVALID-MAX-DONORS))
)
(define-private (validate-category (cat (string-ascii 50)))
  (if (and (> (len cat) u0) (<= (len cat) u50))
      (ok true)
      (err ERR-INVALID-CATEGORY))
)
(define-private (validate-target-audience (audience (string-ascii 100)))
  (if (<= (len audience) u100)
      (ok true)
      (err ERR-INVALID-TARGET-AUDIENCE))
)
(define-private (validate-location (loc (string-ascii 100)))
  (if (<= (len loc) u100)
      (ok true)
      (err ERR-INVALID-LOCATION))
)
(define-private (validate-currency (cur (string-ascii 20)))
  (if (or (is-eq cur "STX") (is-eq cur "BTC") (is-eq cur "USD"))
      (ok true)
      (err ERR-INVALID-CURRENCY))
)
(define-private (validate-oracle (oracle principal))
  (if (not (is-eq oracle tx-sender))
      (ok true)
      (err ERR-INVALID-ORACLE))
)
(define-private (validate-reward-tiers (tiers (list 10 { min-amount: uint, nft-type: (string-ascii 50) })))
  (if (<= (len tiers) u10)
      (ok true)
      (err ERR-INVALID-REWARD-TIER))
)
(define-private (validate-proposal-id (id uint))
  (if (> id u0)
      (ok true)
      (err ERR-INVALID-PROPOSAL-ID))
)
(define-private (validate-voting-period (period uint))
  (if (> period u0)
      (ok true)
      (err ERR-INVALID-VOTING-PERIOD))
)
(define-private (validate-quorum (quorum uint))
  (if (and (> quorum u0) (<= quorum u100))
      (ok true)
      (err ERR-INVALID-QUORUM))
)
(define-private (validate-progress (progress uint))
  (if (<= progress u100)
      (ok true)
      (err ERR-INVALID-PROGRESS))
)
(define-private (validate-principal (p principal))
  (if (not (is-eq p 'SP000000000000000000002Q6VF78))
      (ok true)
      (err ERR-NOT-AUTHORIZED))
)
(define-public (set-authority-contract (contract-principal principal))
  (begin
    (try! (validate-principal contract-principal))
    (asserts! (is-none (var-get authority-contract)) (err ERR-AUTHORITY-NOT-VERIFIED))
    (var-set authority-contract (some contract-principal))
    (ok true)
  )
)
(define-public (set-max-campaigns (new-max uint))
  (begin
    (asserts! (> new-max u0) (err ERR-MAX-CAMPAIGNS-EXCEEDED))
    (asserts! (is-some (var-get authority-contract)) (err ERR-AUTHORITY-NOT-VERIFIED))
    (var-set max-campaigns new-max)
    (ok true)
  )
)
(define-public (set-creation-fee (new-fee uint))
  (begin
    (asserts! (>= new-fee u0) (err ERR-INVALID-UPDATE-PARAM))
    (asserts! (is-some (var-get authority-contract)) (err ERR-AUTHORITY-NOT-VERIFIED))
    (var-set creation-fee new-fee)
    (ok true)
  )
)
(define-public (create-campaign
  (disease-name (string-ascii 100))
  (funding-goal uint)
  (milestones (list 20 { description: (string-ascii 200), amount: uint, achieved: bool }))
  (description (string-ascii 500))
  (start-time uint)
  (end-time uint)
  (min-donation uint)
  (max-donors uint)
  (category (string-ascii 50))
  (target-audience (string-ascii 100))
  (location (string-ascii 100))
  (currency (string-ascii 20))
  (oracle principal)
  (reward-tiers (list 10 { min-amount: uint, nft-type: (string-ascii 50) }))
  (proposal-id uint)
  (voting-period uint)
  (quorum uint)
)
  (let (
        (next-id (var-get next-campaign-id))
        (current-max (var-get max-campaigns))
        (authority (var-get authority-contract))
      )
    (asserts! (< next-id current-max) (err ERR-MAX-CAMPAIGNS-EXCEEDED))
    (try! (validate-disease-name disease-name))
    (try! (validate-funding-goal funding-goal))
    (try! (validate-milestones milestones))
    (try! (validate-description description))
    (try! (validate-start-time start-time))
    (try! (validate-end-time end-time start-time))
    (try! (validate-min-donation min-donation))
    (try! (validate-max-donors max-donors))
    (try! (validate-category category))
    (try! (validate-target-audience target-audience))
    (try! (validate-location location))
    (try! (validate-currency currency))
    (try! (validate-oracle oracle))
    (try! (validate-reward-tiers reward-tiers))
    (try! (validate-proposal-id proposal-id))
    (try! (validate-voting-period voting-period))
    (try! (validate-quorum quorum))
    (asserts! (is-none (map-get? campaigns-by-name disease-name)) (err ERR-CAMPAIGN-ALREADY-EXISTS))
    (let ((authority-recipient (unwrap! authority (err ERR-AUTHORITY-NOT-VERIFIED))))
      (try! (stx-transfer? (var-get creation-fee) tx-sender authority-recipient))
    )
    (map-set campaigns next-id
      {
        creator: tx-sender,
        disease-name: disease-name,
        funding-goal: funding-goal,
        funds-raised: u0,
        milestones: milestones,
        description: description,
        start-time: start-time,
        end-time: end-time,
        status: "active",
        min-donation: min-donation,
        max-donors: max-donors,
        category: category,
        target-audience: target-audience,
        location: location,
        currency: currency,
        oracle: oracle,
        reward-tiers: reward-tiers,
        proposal-id: proposal-id,
        voting-period: voting-period,
        quorum: quorum,
        progress: u0
      }
    )
    (map-set campaigns-by-name disease-name next-id)
    (var-set next-campaign-id (+ next-id u1))
    (print { event: "campaign-created", id: next-id })
    (ok next-id)
  )
)
(define-public (update-campaign
  (campaign-id uint)
  (update-disease-name (string-ascii 100))
  (update-funding-goal uint)
  (update-description (string-ascii 500))
)
  (let ((campaign (map-get? campaigns campaign-id)))
    (match campaign
      c
        (begin
          (asserts! (is-eq (get creator c) tx-sender) (err ERR-NOT-AUTHORIZED))
          (try! (validate-disease-name update-disease-name))
          (try! (validate-funding-goal update-funding-goal))
          (try! (validate-description update-description))
          (let ((existing (map-get? campaigns-by-name update-disease-name)))
            (match existing
              existing-id
                (asserts! (is-eq existing-id campaign-id) (err ERR-CAMPAIGN-ALREADY-EXISTS))
              (begin true)
            )
          )
          (let ((old-name (get disease-name c)))
            (if (is-eq old-name update-disease-name)
                (ok true)
                (begin
                  (map-delete campaigns-by-name old-name)
                  (map-set campaigns-by-name update-disease-name campaign-id)
                  (ok true)
                )
            )
          )
          (map-set campaigns campaign-id
            {
              creator: (get creator c),
              disease-name: update-disease-name,
              funding-goal: update-funding-goal,
              funds-raised: (get funds-raised c),
              milestones: (get milestones c),
              description: update-description,
              start-time: (get start-time c),
              end-time: (get end-time c),
              status: (get status c),
              min-donation: (get min-donation c),
              max-donors: (get max-donors c),
              category: (get category c),
              target-audience: (get target-audience c),
              location: (get location c),
              currency: (get currency c),
              oracle: (get oracle c),
              reward-tiers: (get reward-tiers c),
              proposal-id: (get proposal-id c),
              voting-period: (get voting-period c),
              quorum: (get quorum c),
              progress: (get progress c)
            }
          )
          (map-set campaign-updates campaign-id
            {
              update-disease-name: update-disease-name,
              update-funding-goal: update-funding-goal,
              update-description: update-description,
              update-timestamp: block-height,
              updater: tx-sender
            }
          )
          (print { event: "campaign-updated", id: campaign-id })
          (ok true)
        )
      (err ERR-CAMPAIGN-NOT-FOUND)
    )
  )
)
(define-public (update-campaign-status (campaign-id uint) (new-status (string-ascii 20)))
  (let ((campaign (map-get? campaigns campaign-id)))
    (match campaign
      c
        (begin
          (asserts! (is-eq (get creator c) tx-sender) (err ERR-NOT-AUTHORIZED))
          (try! (validate-status new-status))
          (map-set campaigns campaign-id
            (merge c { status: new-status })
          )
          (print { event: "campaign-status-updated", id: campaign-id, status: new-status })
          (ok true)
        )
      (err ERR-CAMPAIGN-NOT-FOUND)
    )
  )
)
(define-public (update-campaign-progress (campaign-id uint) (new-progress uint))
  (let ((campaign (map-get? campaigns campaign-id)))
    (match campaign
      c
        (begin
          (asserts! (is-eq (get oracle c) tx-sender) (err ERR-NOT-AUTHORIZED))
          (try! (validate-progress new-progress))
          (map-set campaigns campaign-id
            (merge c { progress: new-progress })
          )
          (print { event: "campaign-progress-updated", id: campaign-id, progress: new-progress })
          (ok true)
        )
      (err ERR-CAMPAIGN-NOT-FOUND)
    )
  )
)
(define-public (add-funds-raised (campaign-id uint) (amount uint))
  (let ((campaign (map-get? campaigns campaign-id)))
    (match campaign
      c
        (begin
          (asserts! (is-eq (get status c) "active") (err ERR-INVALID-STATUS))
          (let ((new-raised (+ (get funds-raised c) amount)))
            (map-set campaigns campaign-id
              (merge c { funds-raised: new-raised })
            )
            (if (>= new-raised (get funding-goal c))
                (try! (update-campaign-status campaign-id "completed"))
                (ok true)
            )
            (print { event: "funds-added", id: campaign-id, amount: amount })
            (ok new-raised)
          )
        )
      (err ERR-CAMPAIGN-NOT-FOUND)
    )
  )
)
(define-public (mark-milestone-achieved (campaign-id uint) (milestone-index uint))
  (let ((campaign (map-get? campaigns campaign-id)))
    (match campaign
      c
        (begin
          (asserts! (is-eq (get oracle c) tx-sender) (err ERR-NOT-AUTHORIZED))
          (let ((milestones (get milestones c)))
            (asserts! (< milestone-index (len milestones)) (err ERR-INVALID-MILESTONES))
            (let ((milestone (unwrap-panic (element-at milestones milestone-index))))
              (asserts! (not (get achieved milestone)) (err ERR-INVALID-STATUS))
              (let ((updated-milestone (merge milestone { achieved: true })))
                (let ((updated-milestones (replace-at milestones milestone-index updated-milestone)))
                  (map-set campaigns campaign-id
                    (merge c { milestones: updated-milestones })
                  )
                  (print { event: "milestone-achieved", id: campaign-id, index: milestone-index })
                  (ok true)
                )
              )
            )
          )
        )
      (err ERR-CAMPAIGN-NOT-FOUND)
    )
  )
)
(define-public (get-campaign-count)
  (ok (var-get next-campaign-id))
)
(define-public (check-campaign-existence (name (string-ascii 100)))
  (ok (is-campaign-registered name))
)