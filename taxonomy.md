

# Define the unified structure using OrderedDict to maintain order
gigrilla_taxonomy = OrderedDict({
    "Artist Types": [
        "Live Gig & Original Recording Artist",
        "Original Recording Artist",
        "Live Gig Artist (Cover/Tribute/Classical/Theatrical)",
        "Vocalist for Hire",
        "Instrumentalist for Hire",
        "Songwriter for Hire",
        "Lyricist for Hire",
        "Composer for Hire"
    ],
    "Venue Types": [
        "Public Live Gig Music Venue - Music is Everything",
        "Private Live Gig Music Venue - Music is Entertainment",
        "Dedicated Live Gig Music Venue - Music is an Event",
        "Live Gig Music Festival - Music is Annual",
        "Live Gig Music Promoter - Music is Transient",
        "Fan’s Live Music Gig - Public Venue (Temporary Entity)",
        "Fan’s Live Music Gig - Own Venue (Temporary Entity)"
    ],
    "Music Service Types": [
        "Accounting & Tax",
        "Artist / Booking / Tour Management",
        "Coaching & Development",
        "Event Hospitality",
        "Event Production",
        "Event Safety & Security",
        "Freight & Logistics",
        "Funding, Finance & Insurance",
        "Instrument & Equipment Hire & Repair",
        "Media Company",
        "Music Distribution Service",
        "Music Education",
        "Music Law & Legal Advice",
        "Music Publishing Service",
        "Music Registration (Charts; Rights; Royalties)",
        "Promotion & Branding",
        "Record Label Service",
        "Studios & Production",
        "Sync Licensing",
        "Travel & Accommodation"
    ],
    "Industry Pro Types": [
        "Artist Management (Independent) Pro",
        "Artist Management (Label-based) Pro",
        "Booking Agent Pro",
        "Bookkeeping & Accounts Pro",
        "Coaching Pro",
        "Education / Tutoring Pro",
        "Equipment Repair Pro",
        "Event & Gig Catering Pro",
        "Event & Gig Hospitality Pro",
        "Event & Gig Live Production Pro",
        "Event & Gig Logistics / Customs Pro",
        "Funding / Financial Services Pro",
        "Law & Legal Pro",
        "Marketing / Merchandise Pro",
        "Music Charts Pro",
        "Music Distributor Pro",
        "Music Publisher Pro",
        "Music Registration Pro",
        "Music Sync Licensing Pro",
        "Performing Rights & Royalties Pro",
        "Plug / Promote / Publicise Pro",
        "Radio Pro",
        "Record Label Pro",
        "Safety / Security / Welfare Pro",
        "Studio / Mixing Pro",
        "Travel / Accommodation Pro",
        "TV / Movie Production Pro",
        "Venue Pro"
    ]
})

import pandas as pd
from caas_jupyter_tools import display_dataframe_to_user

# Convert to DataFrame for display
df = pd.DataFrame(dict([(k, pd.Series(v)) for k, v in gigrilla_taxonomy.items()]))

display_dataframe_to_user(name="Gigrilla Taxonomy Reference Sheet", dataframe=df)

Result
                                        Artist Types  \
0               Live Gig & Original Recording Artist   
1                          Original Recording Artist   
2  Live Gig Artist (Cover/Tribute/Classical/Theat...   
3                                  Vocalist for Hire   
4                           Instrumentalist for Hire   

                                         Venue Types  \
0  Public Live Gig Music Venue - Music is Everything   
1  Private Live Gig Music Venue - Music is Entert...   
2  Dedicated Live Gig Music Venue - Music is an E...   
3          Live Gig Music Festival - Music is Annual   
4       Live Gig Music Promoter - Music is Transient   

                  Music Service Types                   Industry Pro Types  
0                    Accounting & Tax  Artist Management (Independent) Pro  
1  Artist / Booking / Tour Management  Artist Management (Label-based) Pro  
2              Coaching & Development                    Booking Agent Pro  
3                   Event Hospitality           Bookkeeping & Accounts Pro  
4                    Event Production                         Coaching Pro  

Gigrilla Taxonomy Reference Sheet

Unable to display visualization

Here is your unified Gigrilla Taxonomy Reference Sheet, combining all key user profile classifications:

Artists

Venues

Music Services

Industry Pros

Each column lists the official “Types” under that category, alphabetised within their group. This structure supports cross-functional indexing, menu logic, search filtering, and profile creation on Gigrilla.