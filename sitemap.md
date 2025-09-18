

0 · GLOBAL COMPONENTS

/search – universal search endpoint (people, music, gigs, posts)

/auth – sign-in / sign-out / social-oauth callbacks

/settings – user settings (profile, privacy, notifications, billing)

/error/* – error pages (404, 500, maintenance)

/legal/* – Terms, Privacy, Cookies, Accessibility, Copyright, AI-Fraud

1 · ROOT & CORE FLOWS
/                       ─ Home (marketing splash)
/signup                 ─ Multi-step registration wizard
/signin                 ─ Quick sign-in
/made-fair              ─ “Music Made Fair” explainer
/my-gigrilla/           ─ Auth-gated dashboard
    ├── feed            – personalised feed
    ├── notifications   – inbox
    ├── messages        – role-aware messaging hub
    ├── switch          – profile switcher (Fan ⇄ Artist etc.)
    └── account         – subscriptions & payments

2 · MUSIC
/music/                       – top-level hub
    ├── stream                – full catalogue explorer
    │     ├── genre/{slug}
    │     ├── mood/{slug}
    │     └── country/{iso}
    ├── download              – same facets, “add-to-cart” flows
    ├── track/{isrc}          – canonical track page
    ├── album/{upc}
    ├── playlist/{id}
    └── charts/               – charts index
          ├── gigrilla/{chartId}
          └── national/{countryCode}

3 · ARTISTS
/artists/                     – directory landing
    ├── search                – facet filters (type, genre, country…)
    ├── type/{1-8}            – preset filter pages
    ├── {artistSlug}          – public artist profile
    │     ├── music           – discography tab
    │     ├── gigs            – upcoming / past gigs
    │     ├── merch           – if enabled
    │     └── posts           – social feed
    └── upload                – authenticated music-upload wizard

4 · VENUES & GIGFINDER
/venues/                      – venue directory
    ├── search
    ├── type/{1-7}
    └── {venueSlug}           – venue profile
          ├── gigs
          ├── facilities
          └── media

/gigs/                         – GigFinder
    ├── search (date, genre, location)
    ├── {gigId}               – gig details + ticket CTA
    ├── book (wizard)         – Artist⇄Venue booking flow
    └── calendar              – monthly view

5 · MUSIC SERVICES DIRECTORY
/services/
    ├── search                – facets (type 1-20 & sub-types)
    ├── type/{1-20}
    └── {serviceSlug}         – service profile (hire/quote form)

6 · INDUSTRY PROS (LINKEDIN-STYLE)
/pros/
    ├── search                – type 1-28, sub-type, availability
    ├── type/{1-28}
    ├── {proSlug}             – pro profile
    │     ├── posts
    │     ├── availability
    │     └── hire            – premium message / contract
    └── premium               – £1/mo upsell page

7 · ADVERTISING
/advertise/
    ├── overview              – formats & reach
    ├── pricing               – rate card
    ├── create-campaign       – self-serve wizard
    └── success-stories

8 · INSIGHTS & FAQ
/insights/                    – blog index
    ├── category/{slug}
    └── {postSlug}

/faq                           – expandable FAQ

9 · CONTACT & REPORTING
/contact/
    ├── general
    ├── copyright-report
    ├── bug-report
    └── press

10 · FOOTER NAV (persistent)

About Us

Careers

Help Centre

Legal links (see section 0)

Social links

Dynamic Template Summary
Template	Key Params	Cross-Link Targets
track	ISRC	Artist, Album, Charts, Genre
gig	gigId	Artist, Venue, Tickets
artist	artistSlug	Tracks, Gigs, Merch, Posts
venue	venueSlug	Gigs, Services nearby, Industry Pros
service	serviceSlug	Artists, Venues
pro	proSlug	Artists, Venues, Services