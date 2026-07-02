# Strategic Memory: Project Brain Context

This file maintains the high-level context, domain model description, and business logic of the Indian Car Recommendation App.

## Project Mission
The goal of this application is to assist Indian car buyers in finding suitable passenger vehicles matching their preferences, driving patterns, family size, and budgets.

---

## Domain Model & Features

The recommendation engine collects inputs via a user questionnaire and scores available models.

### Questionnaire Inputs
- **Budget**: Stored/compared in **Indian Rupees (INR) Lakhs** (e.g. 15.5 Lakhs represents ₹15,50,000).
- **Driving Split**: Usage split between City and Highway (percentages must sum to exactly `100%`).
- **Family Size**: Integer number of passengers (usually 1-10) to determine vehicle seating and cabin requirements.
- **Safety Priority**: Rating on a scale of `1` to `5` to determine minimum crash test rating requirements.
- **Fuel Preference**: Petrol, Diesel, CNG, Hybrid, or Electric.
- **Transmission Preference**: Manual, Automatic, AMT, CVT, or DCT.
- **Preferred Segments**: hatchback, sedan, compact-suv, mid-suv, mpv, or ev.
- **Feature Priorities**: List of key features the user desires (e.g., Sunroof, ADAS, Ventilated Seats, etc.).

### Database Schema Concept
- **`cars`**: Main catalog containing base pricing (Lakhs), safety rating (`0-5`), segment, fuel type, transmission, specification JSON, and tags.
- **`car_images`**: Images linked to each model with ordering metadata.

---

## Recommendation Scoring Formula

Scoring is transparently calculated using a weighted formula. Each recommendation score is built from independent sub-scores totaling up to 100 points:

1. **`budget_fit`** (Weight: **35%**): How closely the car matches the user's budget ceiling without significantly exceeding it.
2. **`use_case_match`** (Weight: **25%**): Compatibility with city/highway split, seating needs, and body style/segment.
3. **`feature_match`** (Weight: **20%**): Coverage of the user's requested features.
4. **`safety`** (Weight: **12%**): Score derived from safety star ratings (0-5 stars) and standard safety packages.
5. **`efficiency`** (Weight: **8%**): Fuel economy (Kmpl) or EV range (Km) suitability based on usage.
