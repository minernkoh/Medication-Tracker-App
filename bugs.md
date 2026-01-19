# Product Development Requirements & Bug Fixes

## Rule Ensure all frontend logic works with backend CRUD and adheres strictly to design system standards.

## 💊 Medication Management & Inventory
- **Column Renaming & Additions:**
    - Rename **"Quantity"** to **"Total Quantity"**.
    - Add a new column titled **"Recommend Supply"**.
    - Rename **"Refill Date"** to **"Refill?"**.
- **Supply Status Logic:** Replace numerical values with status tags based on the ratio of `Total Quantity` vs `Recommend Supply`:
    - **Over:** > 100%
    - **High:** > 70%
    - **Med:** > 30%
    - **Low:** > 0%
    - **Empty:** 0%
- **Refill? Column Logic:** - If Supply Status is **Low** or **Empty**, indicate **"Yes"**.
    - Otherwise, indicate **"No"**.
- **Time Selection & Categorization:**
    - Change 'Morning', 'Afternoon', and 'Night' labels to specific **set timings**.
    - Update all time dropdown selectors to **15-minute intervals** (previously 5 minutes).
- **Taken Medicine UI:** Replace the trash/rubbish bin icon with an **undo icon**. 
- **Inventory Logic:** When an action is "undone" from Taken Today, the quantity must be added back to the "Total Quantity".
- **Strict Form Validation:** Enforce "Field is required" error messages for all mandatory inputs in medication modals.

## 👤 Patient "View Only" Mode (Caregiver Assigned)
- **Status Trigger:** Patient enters "View Only" mode automatically when a caregiver is assigned.
- **User Notification:** Display a popup modal informing the patient of the caregiver assignment.
- **UI Restrictions:** Remove all Call-to-Action (CTA) buttons (Add, Edit, Delete).
- **Side Menu Updates:** - Add a **"View Only"** tag/badge near the account name.
    - Display the assigned caregiver’s name.

## 🤝 Caregiver Mode Enhancements
- **Mode Switching UI:** When switching from Caregiver to Personal Mode, the login/auth modal must use a **blue color theme** (not pink).
- **Dashboard Updates:** - Remove "Today’s Medication" card.
    - Fix "Upcoming Appointments" count tally.
    - Update "Today’s Medication Schedule" to reflect combined schedule, filtered by patient name.
    - Simplify "Today’s Adherence" to a single pie chart without text.
    - Add the calendar feature for viewing progress on other dates.
- **Patient Management:** - Action buttons in the patients table must be always visible.
    - Remove Blood Type, Call button, Edit Profile, and Average Adherence from patient profiles.
    - Prevent caregivers from adding other caregivers.

## 📅 Appointment & Calendar Logic
- **Global Date Formatting:** Change all date displays from MMDDYYYY to **DDMMYYYY** (format: **dd/mm/yy**) across the entire codebase.
- **Dashboard Calendar Indicators:** - **Orange dot indicator** for days with scheduled appointments.
    - **Full green background** for days where 100% of medications are marked as taken.
- **Status Management:** Replace text with a dropdown (Scheduled, Completed, Missed, Cancelled).
- **Auto-Resolution:** Toggle status to "Missed" if current time > appointment time by 1 hour.
- **Default States:** "New Appointment" form defaults to current date and time.

## 🐞 Authentication & General Logic
- **Sign-Up Validation:** Display "Account already exists" if the email is already registered for that account type.
- **Data Sync:** Ensure caregiver-added medications correctly reflect in the specific patient's record.

## 🎨 Global UI/UX & Design Rules
- **Header Consistency:** Remove all icons from page header titles for a clean, text-only style.
- **Empty States:** Finalize the "Upcoming Appointments" card empty state on the dashboard. Match the empty states of other cards.
