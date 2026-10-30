(function () {
  "use strict";
  // English text -> Amharic (from the existing home page translations)
  const AM_BASE = {
    "🎓 An academic community for curious minds":"🎓 ለማወቅ ጉጉት ላላቸው የአካዳሚክ ማህበረሰብ",
    "Think critically. Debate respectfully.":"በትችት ያስቡ። በአክብሮት ይወያዩ።",
    "Learn together.":"አብረን እንማር።",
    "Political Science & International Relations":"የፖለቲካ ሳይንስና ዓለም አቀፍ ግንኙነት",
    "Home":"መነሻ", "Categories":"ምድቦች", "Discussions":"ውይይቶች", "Audio Room":"የድምፅ ክፍል", "About":"ስለ መድረኩ",
    "Log in":"ግባ", "Join forum":"መድረኩን ተቀላቀል", "A space for ideas and dialogue":"የሐሳብና ውይይት መድረክ",
    "Understand the world.":"ዓለምን ይረዱ።", "Shape the debate.":"ውይይት ይቅረጹ።",
    "Connect with students, researchers, and curious minds to explore politics, international affairs, diplomacy, governance, and the ideas shaping our world.":"ፖለቲካን፣ ዓለም አቀፍ ጉዳዮችን፣ ዲፕሎማሲን፣ አስተዳደርንና ዓለማችንን የሚቀርጹ ሐሳቦችን ለመመርመር ከተማሪዎች፣ ከተመራማሪዎችና ከሌሎች ጉጉት ካላቸው ጋር ይገናኙ።",
    "Start a discussion →":"ውይይት ይጀምሩ →", "Explore topics":"ርዕሶችን ያስሱ", "Explore the big questions":"ትልልቅ ጥያቄዎችን ያስሱ",
    "Ideas worth discussing. Perspectives worth understanding.":"ሊወያዩባቸው የሚገቡ ሐሳቦች። ሊረዱ የሚገቡ አመለካከቶች።",
    "Global Affairs":"ዓለም አቀፍ ጉዳዮች", "Power, conflict, and cooperation":"ኃይል፣ ግጭትና ትብብር",
    "Political Theory":"የፖለቲካ ንድፈ ሐሳብ", "Ideas, ideologies, and institutions":"ሐሳቦች፣ ርዕዮተ ዓለሞችና ተቋማት",
    "Diplomacy & Governance":"ዲፕሎማሲና አስተዳደር", "Policy, negotiation, and leadership":"ፖሊሲ፣ ድርድርና አመራር",
    "Explore by topic":"በርዕስ ያስሱ", "Find your area of interest and join the conversation.":"የሚስብዎትን ርዕስ ይምረጡና ውይይቱን ይቀላቀሉ።",
    "View all discussions":"ሁሉንም ውይይቶች ይመልከቱ", "International Relations":"ዓለም አቀፍ ግንኙነት",
    "Global power, security, foreign policy, and world order.":"ዓለም አቀፍ ኃይል፣ ደህንነት፣ የውጭ ፖሊሲና የዓለም ሥርዓት።",
    "Political Science":"የፖለቲካ ሳይንስ", "Political systems, ideologies, elections, and institutions.":"የፖለቲካ ሥርዓቶች፣ ርዕዮተ ዓለሞች፣ ምርጫዎችና ተቋማት።",
    "Diplomacy & Foreign Policy":"ዲፕሎማሲና የውጭ ፖሊሲ", "Negotiations, international cooperation, and statecraft.":"ድርድሮች፣ ዓለም አቀፍ ትብብርና የመንግሥት ዲፕሎማሲ።",
    "Research & Academia":"ምርምርና አካዳሚክ", "Research methods, academic writing, and scholarly debate.":"የምርምር ዘዴዎች፣ አካዳሚክ ጽሑፍና ምሁራዊ ውይይት።",
    "Peace & Security":"ሰላምና ደህንነት", "Conflict prevention, peacebuilding, and security studies.":"ግጭትን መከላከል፣ ሰላምን መገንባትና የደህንነት ጥናት።",
    "Governance & Public Policy":"አስተዳደርና የሕዝብ ፖሊሲ", "Public institutions, development, and policy decisions.":"የሕዝብ ተቋማት፣ ልማትና የፖሊሲ ውሳኔዎች።",
    "African Affairs":"የአፍሪካ ጉዳዮች", "African politics, regional integration, and development.":"የአፍሪካ ፖለቲካ፣ የክልል ውህደትና ልማት።",
    "General Discussion":"አጠቃላይ ውይይት", "Questions, opportunities, and conversations across PSIR.":"በPSIR ዙሪያ ጥያቄዎች፣ ዕድሎችና ውይይቶች።",
    "Hub of Idea Discussion Club":"የሐሳብ ማዕድ ክለብ ማዕከል", "Publish and explore club news, journals, and blogs.":"የክለቡን ዜናዎች፣ የምርምር መጽሔቶችና ብሎጎች ያትሙና ያስሱ።",
    "Community discussions":"የማህበረሰብ ውይይቶች", "Ask questions, share insights, and learn from different perspectives.":"ጥያቄዎችን ይጠይቁ፣ ግንዛቤዎችን ያጋሩና ከተለያዩ አመለካከቶች ይማሩ።",
    "＋ New discussion":"＋ አዲስ ውይይት", "All categories":"ሁሉም ምድቦች", "No discussions yet":"እስካሁን ውይይቶች የሉም",
    "Start the first conversation and help build the PSIR community.":"የመጀመሪያውን ውይይት ይጀምሩና የPSIR ማህበረሰብን ለመገንባት ያግዙ።",
    "Community principles":"የማህበረሰቡ መርሆዎች", "Evidence over assumptions":"ግምት ሳይሆን ማስረጃ", "Support arguments with credible sources.":"ክርክሮችን ታማኝ ምንጮች በመጠቀም ይደግፉ።",
    "Respect different views":"የተለያዩ አመለካከቶችን ያክብሩ", "Challenge ideas without attacking people.":"ሰዎችን ሳያጠቁ ሐሳቦችን ይተቹ።",
    "Learn together":"አብረን እንማር", "Ask questions and share knowledge.":"ጥያቄዎችን ይጠይቁና እውቀትን ያጋሩ።",
    "Getting started":"መጀመሪያ ጀምር", "Have a question about politics, diplomacy, governance, or research? Start a discussion and invite others to contribute.":"ስለ ፖለቲካ፣ ዲፕሎማሲ፣ አስተዳደር ወይም ምርምር ጥያቄ አለዎት? ውይይት ይጀምሩና ሌሎችን ይጋብዙ።",
    "About the community":"ስለ ማህበረሰቡ", "A forum for thoughtful political and international dialogue.":"ለጥልቅ የፖለቲካና ዓለም አቀፍ ውይይት የተዘጋጀ መድረክ።",
    "PSIR Forum is designed as a meeting place for people interested in Political Science and International Relations. It encourages discussion, academic curiosity, and the exchange of ideas.":"PSIR Forum በፖለቲካ ሳይንስና በዓለም አቀፍ ግንኙነት ፍላጎት ያላቸው ሰዎች የሚገናኙበት መድረክ ነው። ውይይትን፣ አካዳሚክ ጉጉትንና የሐሳብ ልውውጥን ያበረታታል።",
    "Whether you are a student beginning your studies, a researcher developing an argument, or simply interested in world affairs, you can use this space to explore questions and learn from others.":"ትምህርትዎን የጀመሩ ተማሪ፣ ክርክር የሚያዳብሩ ተመራማሪ ወይም በዓለም ጉዳዮች ፍላጎት ያለዎት ሰው ቢሆኑም፣ ጥያቄዎችን ለማስሳትና ከሌሎች ለመማር ይህን መድረክ መጠቀም ይችላሉ።",
    "Join the conversation":"ውይይቱን ይቀላቀሉ", "Critical thinking":"ትችታዊ አስተሳሰብ", "Examine assumptions, compare perspectives, and ask better questions.":"ግምቶችን ይመርምሩ፣ አመለካከቶችን ያነጻጽሩና የተሻሉ ጥያቄዎችን ይጠይቁ።",
    "Global perspectives":"ዓለም አቀፍ አመለካከቶች", "Discuss local, regional, and international issues with an open mind.":"የአካባቢ፣ የክልልና ዓለም አቀፍ ጉዳዮችን በክፍት አስተሳሰብ ይወያዩ።",
    "Academic development":"አካዳሚክ እድገት", "Exchange ideas about research, theory, policy, and professional growth.":"ስለ ምርምር፣ ንድፈ ሐሳብ፣ ፖሊሲና ሙያዊ እድገት ሐሳቦችን ይለዋወጡ።",
    "Responsible participation":"ኃላፊነት ያለው ተሳትፎ", "Keep conversations constructive and avoid harassment or personal attacks.":"ውይይቶችን ገንቢ ያድርጉ፤ ትንኮሳንና የግል ጥቃትን ያስወግዱ።",
    "Have an idea worth discussing?":"ሊወያዩበት የሚገባ ሐሳብ አለዎት?", "Share a question, propose an argument, or start an academic conversation.":"ጥያቄ ያጋሩ፣ ክርክር ያቅርቡ ወይም አካዳሚክ ውይይት ይጀምሩ።",
    "Create a discussion →":"ውይይት ይፍጠሩ →", "Explore":"ያስሱ", "Topics":"ርዕሶች", "Live Room":"የአካዳሚክ ድምፅ ክፍል", "About PSIR Forum":"ስለ PSIR Forum", "Participate":"ይሳተፉ", "My bookmarks":"ያስቀመጥኳቸው", "Community principles":"የማህበረሰቡ መርሆዎች",
    "Connect with us":"ያግኙን", "Telegram Channel":"የቴሌግራም ቻናል", "Facebook Page":"የፌስቡክ ገጽ",
    "A community for thoughtful discussion of Political Science, International Relations, diplomacy, governance, and global affairs.":"በፖለቲካ ሳይንስ፣ በዓለም አቀፍ ግንኙነት፣ በዲፕሎማሲ፣ በአስተዳደርና በዓለም አቀፍ ጉዳዮች ላይ ለጥልቅ ውይይት የተዘጋጀ ማህበረሰብ።",
    "All rights reserved.":"መብቱ የተጠበቀ ነው።", "Start a discussion":"ውይይት ይጀምሩ", "Share a question or idea with the PSIR community.":"ጥያቄ ወይም ሐሳብ ከPSIR ማህበረሰብ ጋር ያጋሩ።",
    "Discussion title":"የውይይት ርዕስ", "What would you like to discuss?":"ስለ ምን መወያየት ይፈልጋሉ?", "Category":"ምድብ", "Publishing type":"የህትመት ዓይነት", "Discussion":"ውይይት", "News":"ዜና", "Journal":"የምርምር መጽሔት", "Blog":"ብሎግ",
    "For Hub of Idea Discussion Club, choose News, Journal, or Blog.":"ለሐሳብ ውይይት ክለብ ማዕከል ዜና፣ የምርምር መጽሔት ወይም ብሎግ ይምረጡ።",
    "Display name":"የሚታይ ስም", "How should your name appear?":"ስምዎ እንዴት እንዲታይ ይፈልጋሉ?", "Your discussion":"ውይይትዎ", "Explain your question, share your argument, or provide context...":"ጥያቄዎን ያብራሩ፣ ክርክርዎን ያጋሩ ወይም የጀርባ ሁኔታ ያቅርቡ...",
    "Maximum 5,000 characters. Be respectful and constructive.":"ከፍተኛው 5,000 ፊደሎች ነው። በአክብሮትና በገንቢ መንገድ ይጻፉ።", "Your discussion will be published to the PSIR Forum community. Please keep your contributions respectful and constructive.":"ውይይትዎ በPSIR Forum ማህበረሰብ ውስጥ ይታተማል። አስተዋጽኦዎን በአክብሮትና በገንቢ መንገድ ያቅርቡ።", "Publish discussion":"ውይይትን አትም",
    "Welcome to PSIR Forum":"ወደ PSIR Forum እንኳን በደህና መጡ", "Connect with the academic community.":"ከአካዳሚክ ማህበረሰቡ ጋር ይገናኙ።", "Your name":"ስምዎ", "Email address":"የኢሜይል አድራሻ", "Password":"የይለፍ ቃል", "At least 8 characters":"ቢያንስ 8 ቁምፊዎች", "Your account is secured through Supabase authentication. Never share your password with anyone.":"መለያዎ በSupabase ማረጋገጫ የተጠበቀ ነው። የይለፍ ቃልዎን ለማንም አያጋሩ።", "Continue":"ቀጥል", "Need an account? Register":"መለያ የለዎትም? ይመዝገቡ",
    "Search discussions, ideas, or topics...":"ውይይቶችን፣ ሐሳቦችን ወይም ርዕሶችን ይፈልጉ...", "No bookmarked discussions":"የተቀመጡ ውይይቶች የሉም", "No matching discussions":"የሚዛመዱ ውይይቶች አልተገኙም", "Log in and save discussions to find them here.":"እዚህ ለማግኘት ይግቡና ውይይቶችን ያስቀምጡ።", "Try a different search or category, or start a new conversation.":"ሌላ ፍለጋ ወይም ምድብ ይሞክሩ፣ ወይም አዲስ ውይይት ይጀምሩ።",
    "Community contributor":"የማህበረሰብ አስተዋጽኦ አቅራቢ", "Saved":"ተቀምጧል", "Save":"አስቀምጥ", "reply":"መልስ", "replies":"መልሶች", "Delete":"ሰርዝ", "No replies yet. Start the conversation.":"እስካሁን መልስ የለም። ውይይቱን ይጀምሩ።", "Write a thoughtful reply...":"ገንቢ መልስ ይጻፉ...", "Log in to reply":"ለመመለስ ይግቡ", "Reply":"መልስ ይስጡ",
    "Please log in to save discussions.":"ውይይቶችን ለማስቀመጥ እባክዎ ይግቡ።", "Removed from your bookmarks.":"ከተቀመጡት ውይይቶች ተወግዷል።", "Discussion saved to your bookmarks.":"ውይይቱ በተቀመጡት ውስጥ ተቀምጧል።", "Please log in before replying.":"መልስ ከመስጠትዎ በፊት እባክዎ ይግቡ።", "Your reply has been published.":"መልስዎ ታትሟል።", "Discussion deleted.":"ውይይቱ ተሰርዟል።", "You have logged out.":"ከመለያዎ ወጥተዋል።", "Please log in to start a discussion.":"ውይይት ለመጀመር እባክዎ ይግቡ።", "Please wait...":"እባክዎ ይጠብቁ...", "Your account has been created.":"መለያዎ ተፈጥሯል።", "Welcome back to PSIR Forum!":"ወደ PSIR Forum እንኳን በደህና ተመለሱ!", "Please log in before publishing.":"ከማተምዎ በፊት እባክዎ ይግቡ።", "Please choose News, Journal, or Blog for Hub of Idea posts.":"ለHub of Idea ልጥፎች ዜና፣ የምርምር መጽሔት ወይም ብሎግ ይምረጡ።", "Please complete all required fields.":"እባክዎ ሁሉንም አስፈላጊ መስኮች ይሙሉ።", "Your discussion has been published!":"ውይይትዎ ታትሟል!", "Please log in to see your bookmarks.":"ያስቀመጧቸውን ለማየት እባክዎ ይግቡ።"
  };

  // English text -> translations. Tigrinya, Afaan Oromo and Af Somali are drafts for native-speaker review.
  const EXTRA = {
    "Home": { am: "መነሻ", ti: "መበገሲ", om: "Mana", so: "Bogga hore" },
    "Categories": { am: "ምድቦች", ti: "ምድባት", om: "Gosoota", so: "Qaybaha" },
    "Discussions": { am: "ውይይቶች", ti: "ዘተታት", om: "Mari'annaa", so: "Doodaha" },
    "Research Hub": { am: "የምርምር ማዕከል", ti: "ማእከል ምርምር", om: "Giddu-galaa Qorannoo", so: "Xarunta Cilmi-baadhista" },
    "News & Journal": { am: "ዜና እና ጆርናል", ti: "ዜናን ጆርናልን", om: "Oduu fi Joornaala", so: "Warar iyo Joornaal" },
    "Saved papers": { am: "የተቀመጡ ጽሑፎች", ti: "ዝተዓቀቡ ጽሑፋት", om: "Barreeffamoota kuufaman", so: "Qoraallada la kaydiyey" },
    "Live Room": { am: "የቀጥታ ክፍል", ti: "ቀጥታዊ ክፍሊ", om: "Kutaa kallattii", so: "Qolka tooska ah" },
    "About": { am: "ስለ እኛ", ti: "ብዛዕባ", om: "Waa'ee", so: "Ku saabsan" },
    "My profile": { am: "የእኔ መገለጫ", ti: "መገለጫይ", om: "Profaayilii koo", so: "Boggeyga gaarka ah" },
    "Log in": { am: "ግባ", ti: "እቶ", om: "Seeni", so: "Gal" },
    "Log out": { am: "ውጣ", ti: "ውጻእ", om: "Ba'i", so: "Ka bax" },
    "Create Account": { am: "መለያ ፍጠር", ti: "ኣካውንት ፍጠር", om: "Herrega uumi", so: "Akoon samee" },
    "Join forum": { am: "መድረኩን ተቀላቀል", ti: "ኣብ ፎረም ተጸምበር", om: "Fooramicha irratti makami", so: "Ku biir madasha" },
    "Explore Discussions": { am: "ውይይቶችን ያስሱ", ti: "ዘተታት ዳህስሱ", om: "Mari'annaa qoradhaa", so: "Sahami doodaha" },
    "Join the Community": { am: "ማኅበረሰቡን ይቀላቀሉ", ti: "ኣብ ማሕበረሰብ ተጸምበሩ", om: "Hawaasa keessatti makamaa", so: "Ku biir bulshada" },
    "Understand the world.": { am: "ዓለምን ይረዱ።", ti: "ዓለም ተረድኡ።", om: "Addunyaa hubadhaa.", so: "Adduunka fahma." },
    "Shape the debate.": { am: "ውይይቱን ይቅረጹ።", ti: "ነቲ ዘተ ቅረጹ።", om: "Marii bocaa.", so: "Qaabee doodda." },
    "Ideas Worth Exploring": { am: "ሊመረመሩ የሚገቡ ሀሳቦች", ti: "ክድህሰሱ ዝግበኦም ሓሳባት", om: "Yaadota qorachuun malu", so: "Fikrado mudan in la baadho" },
    "Light": { am: "ብርሃን", ti: "ብርሃን", om: "Ifa", so: "Iftiin" },
    "Dark": { am: "ጨለማ", ti: "ጸልማት", om: "Dukkana", so: "Madow" },
    "System": { am: "ስርዓት", ti: "ስርዓት", om: "Sirna", so: "Nidaamka" },
    "Submit Research": { am: "ምርምር አስገባ", ti: "ምርምር ኣእቱ", om: "Qorannoo galchi", so: "Cilmi-baadhis soo gudbi" },
    "Recently Published": { am: "በቅርቡ የታተሙ", ti: "ቀረባ ግዜ ዝተሓትሙ", om: "Yeroo dhiyoo keessa maxxanfame", so: "Dhawaan la daabacay" },
    "Search title, author, field, or keyword": { am: "በርዕስ፣ በደራሲ፣ በመስክ ወይም በቁልፍ ቃል ይፈልጉ", ti: "ብርእስ፣ ብጸሓፊ፣ ብመስክ ወይ ብቁልፍ ቃል ድለዩ", om: "Mata-duree, barreessaa, fagoo ykn jechoota furmaataatiin barbaadi", so: "Ciwaan, qoraa, goob ama ereyo muhiim ah ku raadi" },
    "All types": { am: "ሁሉም ዓይነቶች", ti: "ኩሎም ዓይነታት", om: "Gosoota hunda", so: "Dhammaan noocyada" },
    "My submissions": { am: "የእኔ ማስገቢያዎች", ti: "ናተይ ምልኣኽታት", om: "Galmeewwan koo", so: "Gudbintayda" },
    "Your drafts and submissions, with status and any feedback from moderators.": { am: "ረቂቆችዎ እና ማስገቢያዎችዎ፣ ከሁኔታ እና ከአወያዮች አስተያየት ጋር።", ti: "ረቂቕካትን ምልኣኽታትካን፣ ብሕቶን ካብ ኣወያይቲ ዝመጸ ኣስተያየትን።", om: "Barreeffamoota fi galmee kee, haala isaa fi yaada moderaatoota wajjin.", so: "Qabyaha iyo gudbinadaada, oo leh xaaladda iyo jawaabta moderaatorada." },
    "Moderator review queue": { am: "የአወያይ ግምገማ ወረፋ", ti: "ሰልፊ ምርመራ ኣወያዪ", om: "Jiruu madaalii moderaatoota", so: "Safka dib-u-eegista moderaatorka" },
    "Visible to moderators only. Reviews are recorded with your name and the time of each decision.": { am: "ለአወያዮች ብቻ የሚታይ። እያንዳንዱ ውሳኔ በስምዎ እና በጊዜው ይመዘገባል።", ti: "ንኣወያይቲ ጥራይ ዝርአ። ነፍሲ ወከፍ ውሳኔ ብስምካን ብግዜኡ ይዝከር።", om: "Moderaatota qofaaf mull'ata. Murtii tokkoo tokkoo maqaa keetii fi yeroo isaatiin galmaa'a.", so: "Moderaatorka keliya ayaa arki kara. Go'aan kasta magacaaga iyo waqtigiisa ayaa lagu diiwaangeliyaa." },
    "Save draft": { am: "ረቂቅ አስቀምጥ", ti: "ረቂቕ ዓቅብ", om: "Barreeffama kuusi", so: "Qabyada kaydi" },
    "Submit for review": { am: "ለግምገማ አስገባ", ti: "ንምምርማር ኣእቱ", om: "Madaalii dhiyeessi", so: "Dib-u-eegis u gudbi" },
    "Cancel": { am: "ይቅር", ti: "ሰርዝ", om: "Haquu", so: "Jooji" },
    "Preview": { am: "ቅድመ-እይታ", ti: "ቅድሚ-ምርኣይ", om: "Duraa ilaali", so: "Horay u eeg" },
    "Read, save and comment": { am: "ያንብቡ፣ ያስቀምጡ እና አስተያየት ይስጡ", ti: "ኣንብብ፣ ዓቅብ፣ ኣስተያይት ሃብ", om: "Dubbisi, kuusi fi yaada kenni", so: "Akhri, kaydi oo faallo ku qor" },
    "Open PDF": { am: "PDF ክፈት", ti: "PDF ክፈት", om: "PDF banaa", so: "PDF fur" },
    "Edit": { am: "አርም", ti: "ኣርም", om: "Gulaali", so: "Wax ka beddel" },
    "Withdraw": { am: "ሰርዝና አቁም", ti: "ኣቋርጽ", om: "Haqi", so: "Ka noqo" },
    "Delete": { am: "ሰርዝ", ti: "ሰርዝ", om: "Haqi", so: "Tirtir" },
    "Delete draft": { am: "ረቂቁን ሰርዝ", ti: "ረቂቕ ሰርዝ", om: "Barreeffama haqi", so: "Qabyada tirtir" },
    "Write for the Journal": { am: "ለጆርናሉ ጻፍ", ti: "ንጆርናል ጸሓፍ", om: "Joornaalaaf barreessi", so: "Joornaalka u qor" },
    "Submit a news item": { am: "የዜና ንጥል አስገባ", ti: "ናይ ዜና ንጥል ኣእቱ", om: "Oduu dhiyeessi", so: "Warbixin cusub soo gudbi" },
    "Featured article": { am: "ተመራጭ ጽሑፍ", ti: "ዝተመረጸ ጽሑፍ", om: "Barreeffama filatamaa", so: "Maqaal la doortay" },
    "Latest news": { am: "የቅርብ ጊዜ ዜናዎች", ti: "ናይ ቀረባ ግዜ ዜናታት", om: "Oduu dhiyoo", so: "Wararka ugu dambeeya" },
    "Recent journal articles and analysis": { am: "የቅርብ ጊዜ የጆርናል ጽሑፎችና ትንታኔዎች", ti: "ናይ ቀረባ ግዜ ጆርናል ጽሑፋትን ትንተናታትን", om: "Barreeffamoota joornaalaa dhiyoo fi xiinxala", so: "Maqaalada joornaalka ee dhow iyo falanqeyn" },
    "My news and journal submissions": { am: "የእኔ የዜና እና የጆርናል ማስገቢያዎች", ti: "ናተይ ናይ ዜናን ጆርናልን ምልኣኽታት", om: "Galmeewwan oduu fi joornaala koo", so: "Gudbinadayda warka iyo joornaalka" },
    "Search news and journal items": { am: "የዜናና የጆርናል ንጥሎችን ይፈልጉ", ti: "ናይ ዜናን ጆርናልን ንጥልታት ድለዩ", om: "Meeshaalee oduu fi joornaalaa barbaadi", so: "Raadi wararka iyo joornaalka" },
    "All items": { am: "ሁሉም ንጥሎች", ti: "ኩሎም ንጥልታት", om: "Meeshaalee hunda", so: "Dhammaan waxyaabaha" },
    "News only": { am: "ዜና ብቻ", ti: "ዜና ጥራይ", om: "Oduu qofa", so: "Warar kaliya" },
    "Journal only": { am: "ጆርናል ብቻ", ti: "ጆርናል ጥራይ", om: "Joornaala qofa", so: "Joornaal kaliya" },
    "Read more →": { am: "ተጨማሪ ያንብቡ →", ti: "ዝያዳ ኣንብብ →", om: "Dabalata dubbisi →", so: "Dheeraad akhri →" },
    "Read the article →": { am: "ጽሑፉን ያንብቡ →", ti: "ጽሑፉ ኣንብብ →", om: "Barreeffama dubbisi →", so: "Maqaalka akhri →" },
    "Abstract": { am: "ማጠቃለያ", ti: "ጽንጥሎ", om: "Cuunfaa", so: "Soo koobid" },
    "Full text": { am: "ሙሉ ጽሑፍ", ti: "ምሉእ ጽሑፍ", om: "Barreeffama guutuu", so: "Qoraalka oo dhan" },
    "Comments": { am: "አስተያየቶች", ti: "ኣስተያያት", om: "Yaadota", so: "Faallooyin" },
    "Save": { am: "አስቀምጥ", ti: "ዓቅብ", om: "Kuusi", so: "Kaydi" },
    "Share": { am: "አጋራ", ti: "ኣካፍል", om: "Qooddadhu", so: "Wadaag" },
    "Report": { am: "ሪፖርት አድርግ", ti: "ሪፖርት ግበር", om: "Gabaasi", so: "Warbixin soo gudbi" },
    "Post comment": { am: "አስተያየት ላክ", ti: "ኣስተያይት ለኣኽ", om: "Yaada ergi", so: "Faallo dir" },
    "Published on PSIR Forum. This is moderated publication, not formal peer review or journal acceptance.": { am: "በPSIR Forum ታትሟል። ይህ በአወያይ የተፈተሸ ህትመት ነው፣ መደበኛ የአቻ ግምገማ ወይም የጆርናል ተቀባይነት አይደለም።", ti: "ኣብ PSIR Forum ተሓቲሙ። እዚ ብኣወያይ ዝተመርመረ ሕታም እዩ፣ መደበኛ ናይ ሰሙን ምርመራ ወይ ናይ ጆርናል ተቀባልነት ኣይኮነን።", om: "PSIR Forum irratti maxxanfameera. Kun maxxansa moderaatoota irratti madaalame dha; madaalii peer ykn fudhachuu joornaalaa miti.", so: "Waxaa lagu daabacay PSIR Forum. Tani waa daabacaad la xaqiijiyay oo ay moderaatorku eegay; ma aha dib-u-eegis rasmi ah ama aqbalaad joornaal." },
    "Research Papers": { am: "የምርምር ወረቀቶች", ti: "ናይ ምርምር ጽሑፋት", om: "Barreeffamoota qorannoo", so: "Warqadaha cilmi-baadhista" },
    "Academic Articles": { am: "የአካዳሚክ ጽሑፎች", ti: "ናይ ኣካዳሚ ጽሑፋት", om: "Barreeffamoota barnoota", so: "Maqaalada akadeemiga" },
    "Policy Briefs": { am: "የፖሊሲ ማጠቃለያዎች", ti: "ናይ ፖሊሲ ሓጺር ሰነዳት", om: "Gabaasa imaammataa gabaabaa", so: "Warbixinno siyaasadeed" },
    "Literature Reviews": { am: "የጽሑፍ ግምገማዎች", ti: "ናይ ስነ-ጽሑፍ ግምገማታት", om: "Madaalii barruu", so: "Dib-u-eegista suugaanta" },
    "Theses": { am: "ጥናታዊ ጽሑፎች", ti: "ጽሑፋት ናይ ዲግሪ", om: "Qorannoo digirii", so: "Tesiska" },
    "Research Questions": { am: "የምርምር ጥያቄዎች", ti: "ናይ ምርምር ሕቶታት", om: "Gaaffii qorannoo", so: "Su'aalaha cilmi-baadhista" },
    // Body text: Amharic reviewed-style draft; Tigrinya, Afaan Oromoo and Af Somali are drafts pending native-speaker review.
    "International Relations": { am: "ዓለም አቀፍ ግንኙነት", ti: "ዓለም-ለኻዊ ርክብ", om: "Walqunnamtii Addunyaa", so: "Xiriirka Caalamka" },
    "Political Science": { am: "የፖለቲካ ሳይንስ", ti: "ሳይንስ ፖለቲካ", om: "Saayinsii Siyaasaa", so: "Cilmiga Siyaasadda" },
    "Diplomacy & Foreign Policy": { am: "ዲፕሎማሲ እና የውጭ ፖሊሲ", ti: "ዲፕሎማስን ናይ ወጻኢ ፖሊሲን", om: "Diplomaasii fi Imaammata Alaa", so: "Diblomaasiyadda iyo Siyaasadda Dibadda" },
    "Research & Academia": { am: "ምርምር እና አካዳሚ", ti: "ምርምርን ኣካዳሚን", om: "Qorannoo fi Barnoota", so: "Cilmi-baadhista iyo Akadeemiyada" },
    "Peace & Security": { am: "ሰላም እና ደህንነት", ti: "ሰላምን ጸጥታን", om: "Nagaa fi Nageenya", so: "Nabadda iyo Amniga" },
    "Governance & Public Policy": { am: "አስተዳደር እና የህዝብ ፖሊሲ", ti: "ምምሕዳርን ህዝባዊ ፖሊሲን", om: "Bulchiinsa fi Imaammata Uummataa", so: "Maamulka iyo Siyaasadda Dadweynaha" },
    "African Affairs": { am: "የአፍሪካ ጉዳዮች", ti: "ናይ ኣፍሪቃ ጉዳያት", om: "Qabiyyee Afrikaa", so: "Arrimaha Afrika" },
    "General Discussion": { am: "አጠቃላይ ውይይት", ti: "ሓፈሻዊ ዘተ", om: "Mari'annaa waliigalaa", so: "Doodda guud" },
    "Hub of Idea Discussion Club": { am: "የሃሳብ ማዕድ የውይይት ክበብ", ti: "ናይ ሓሳብ መዓድ ናይ ዘተ ክበብ", om: "Kilabii mari'annaa Hub of Idea", so: "Naadiga doodda Hub of Idea" },
    "Ethiopian Politics & Affairs": { am: "የኢትዮጵያ ፖለቲካ እና ጉዳዮች", ti: "ናይ ኢትዮጵያ ፖለቲካን ጉዳያትን", om: "Siyaasa fi Qabiyyee Itoophiyaa", so: "Siyaasadda iyo Arrimaha Itoobiya" },
    "Global power, security, foreign policy, and world order.": { am: "ዓለም አቀፍ ኃይል፣ ደህንነት፣ የውጭ ፖሊሲ እና የዓለም ሥርዓት።", ti: "ዓለም-ለኻዊ ሓይሊ፣ ጸጥታ፣ ናይ ወጻኢ ፖሊሲን ናይ ዓለም ስርዓትን።", om: "Aangoo addunyaa, nageenya, imaammata alaa fi ajaja addunyaa.", so: "Awoodda caalamka, amniga, siyaasadda dibadda iyo nidaamka adduunka." },
    "Political systems, ideologies, elections, and institutions.": { am: "የፖለቲካ ስርዓቶች፣ ርዕዮተ ዓለሞች፣ ምርጫዎች እና ተቋማት።", ti: "ስርዓታት ፖለቲካ፣ ርእይታት፣ ምርጫታትን ተቓውሞታትን።", om: "Sirnoota siyaasaa, ilaalcha, filannoo fi dhaabbilee.", so: "Nidaamyada siyaasadda, fikradaha, doorashooyinka iyo hay'adaha." },
    "Negotiations, international cooperation, and statecraft.": { am: "ድርድር፣ ዓለም አቀፍ ትብብር እና የመንግሥት ጥበብ።", ti: "ምድራድር፣ ዓለም-ለኻዊ ትሕብባርን ጥበብ መንግስትን።", om: "Walarraasuu, walta'iinsa addunyaa fi ogummaa mootummaa.", so: "Wada-hadallada, iskaashiga caalamka iyo farsamada dawladnimada." },
    "Research methods, academic writing, and scholarly debate.": { am: "የምርምር ዘዴዎች፣ የአካዳሚክ ጽሑፍ እና የምሁራዊ ክርክር።", ti: "ኣገባባት ምርምር፣ ናይ ኣካዳሚ ጽሒፍን ናይ ምሁራን ክርክርን።", om: "Mala qorannoo, barreessuu akademikaa fi falmii ogeeyyii.", so: "Habka cilmi-baadhista, qorista akadeemiga iyo doodaha aqoonyahanka." },
    "Conflict prevention, peacebuilding, and security studies.": { am: "ግጭት መከላከል፣ ሰላም ግንባታ እና የደህንነት ጥናቶች።", ti: "ምኽላኽል ግጭት፣ ሰላም ምህናጽን ናይ ጸጥታ ጽናታትን።", om: "Ittisa rakkoo, ijaarsa nagaa fi qorannoo nageenyaa.", so: "Ka hortagga dagaalka, dhismaha nabadda iyo cilmiga amniga." },
    "Public institutions, development, and policy decisions.": { am: "የህዝብ ተቋማት፣ ልማት እና የፖሊሲ ውሳኔዎች።", ti: "ህዝባዊ ተቓውሞታት፣ ምዕባለ፣ ናይ ፖሊሲ ውሳነታትን።", om: "Dhaabbilee uummataa, guddina fi murtii imaammataa.", so: "Hay'adaha dadweynaha, horumarka iyo go'aannada siyaasadda." },
    "African politics, regional integration, and development.": { am: "የአፍሪካ ፖለቲካ፣ የክልል ውህደት እና ልማት።", ti: "ፖለቲካ ኣፍሪቃ፣ ውህደት ዞባን ምዕባለን።", om: "Siyaasa Afrikaa, walitti hidhamuu naannoo fi guddina.", so: "Siyaasadda Afrika, isku-xidhka gobolka iyo horumarka." },
    "Questions, opportunities, and conversations across PSIR.": { am: "በPSIR ውስጥ ጥያቄዎች፣ እድሎች እና ውይይቶች።", ti: "ኣብ PSIR ሕቶታት፣ ዕድላትን ዘተታትን።", om: "Gaaffiiwwan, carraawwan fi haasa'a PSIR keessatti.", so: "Su'aalaha, fursadaha iyo wada-hadalada PSIR dhexdeeda." },
    "Ethiopian politics, governance, federalism, elections, and current affairs.": { am: "የኢትዮጵያ ፖለቲካ፣ አስተዳደር፣ ፌዴራሊዝም፣ ምርጫ እና ወቅታዊ ጉዳዮች።", ti: "ፖለቲካ ኢትዮጵያ፣ ምምሕዳር፣ ፈደራሊዝም፣ ምርጫን ናይ ሕጂ ጉዳያትን።", om: "Siyaasa Itoophiyaa, bulchiinsa, federaalizimii, filannoo fi qabiyyee ammaa.", so: "Siyaasadda Itoobiya, maamulka, federaalka, doorashooyinka iyo arrimaha hadda jira." },
    "Research & Academia Hub": { am: "የምርምር እና አካዳሚ ማዕከል", ti: "ማእከል ምርምርን ኣካዳሚን", om: "Giddu-galaa Qorannoo fi Barnoota", so: "Xarunta Cilmi-baadhista iyo Akadeemiyada" },
    "Share knowledge. Publish research. Connect ideas. Advance understanding.": { am: "ዕውቀት ያካፍሉ። ምርምር ያትሙ። ሃሳቦችን ያገናኙ። ግንዛቤን ያሳድጉ።", ti: "ፍልጠት ኣካፍሉ። ምርምር ሕተሙ። ሓሳባት ኣራኽቡ። ምርዳእ ኣዕብዩ።", om: "Beekumsa qoodaa. Qorannoo maxxansaa. Yaadota walitti hidhaa. Hubannaa guddisaa.", so: "Aqoon wadaago. Cilmi-baadhis daabac. Fikrado isku xidh. Fahamka kor u qaad." },
    "Submit research": { am: "ምርምር አስገባ", ti: "ምርምር ኣእቱ", om: "Qorannoo galchi", so: "Cilmi-baadhis soo gudbi" },
    "Approved publications. Each one has been reviewed by a moderator. This is moderated publication, not formal peer review.": { am: "የጸደቁ ህትመቶች። እያንዳንዳቸው በአወያይ ተገምግመዋል። ይህ በአወያይ የተፈተሸ ህትመት ነው፣ መደበኛ የአቻ ግምገማ አይደለም።", ti: "ዝጸድቁ ሕታማት። ነፍሲ ወከፎም ብኣወያይ ተገምገሙ። እዚ ብኣወያይ ዝተመርመረ ሕታም እዩ፣ መደበኛ ናይ ሰሙን ምርመራ ኣይኮነን።", om: "Maxxansa mirkanaa'anii. Tokkoon tokkoon isaanii moderaatotaan madaalameera. Kun maxxansa moderaatoota irratti madaalame dha; madaalii peer foormaalaa miti.", so: "Daabacaadaha la ansixiyay. Mid kasta waxaa eegay moderaatorka. Tani waa daabacaad la eegay; ma aha dib-u-eegis rasmi ah." },
    "Hub sections": { am: "የማዕከሉ ክፍሎች", ti: "ክፍልታት ማእከል", om: "Kutaalee giddu-galaa", so: "Qaybaha xarunta" },
    "Full research papers, once approved.": { am: "ሙሉ የምርምር ወረቀቶች፣ ከጸደቁ በኋላ።", ti: "ምሉእ ናይ ምርምር ጽሑፋት፣ ድሕሪ ምጽዳቕ።", om: "Warqaa qorannoo guutuu, yeroo mirkanaa'an.", so: "Warqadaha cilmi-baadhista oo buuxa, marka la ansixiyo." },
    "Articles on political science and international relations.": { am: "በፖለቲካ ሳይንስ እና ዓለም አቀፍ ግንኙነት ላይ ጽሑፎች።", ti: "ኣብ ሳይንስ ፖለቲካን ዓለም-ለኻዊ ርክብን ዝተዋህቡ ጽሑፋት።", om: "Barreeffamoota saayinsii siyaasaa fi walqunnamtii addunyaa irratti.", so: "Maqaalo ku saabsan cilmiga siyaasadda iyo xiriirka caalamka." },
    "Short, policy-focused summaries of research.": { am: "አጭር፣ በፖሊሲ ላይ ያተኮሩ የምርምር ማጠቃለያዎች።", ti: "ሓጺር፣ ኣብ ፖሊሲ ዘተኰረ ጠቕላላ ምርምር።", om: "Cuunfaawwan gabaabaa, imaammata irratti xiyyeeffatan.", so: "Soo koobid gaaban, oo ku saabsan siyaasadda." },
    "Undergraduate, master's, and doctoral theses.": { am: "የመጀመሪያ ዲግሪ፣ ማስተርስ እና ዶክትሬት ጥናቶች።", ti: "ናይ ቀዳማይ ዲግሪ፣ ማስተርስን ዶክትሬትን ጽሑፋት።", om: "Qorannoo digirii jalqabaa, masterii fi doktoraa.", so: "Tesisyada digriga koowaad, masterka iyo dhakhtarka." },
    "Overviews of existing research on a topic.": { am: "በርዕስ ላይ ያለ ነባር ምርምር ማጠቃለያ።", ti: "ኣብ ብርእሲ ዘሎ ምርምር ሓፈሻዊ ሓበሬታ።", om: "Ilaalcha qorannoo jiru mata-duree irratti.", so: "Dulmar guud oo cilmi-baadhis jira mawduuc." },
    "Open questions members want to explore.": { am: "አባላት ለመመርመር የሚፈልጓቸው ክፍት ጥያቄዎች።", ti: "ኣባላት ክመርምርዎም ዝደልይዎም ክፉታት ሕቶታት።", om: "Gaaffiiwwan banaa miseensoonni qorachuu barbaadan.", so: "Su'aalo furan oo xubnaha rabaan inay baaraan." },
    "More sections will open as the hub grows.": { am: "ማዕከሉ ሲያድግ ተጨማሪ ክፍሎች ይከፈታሉ።", ti: "ማእከል ምስ ዓበየ ተወሰኽቲ ክፍልታት ይኸፍቱ።", om: "Kutaalee dabalataa yeroo giddu-galaan guddatu banamu.", so: "Qaybo dheeraad ah ayaa furmi doona markii xarunta ay koro." },
    "Drafts stay private. A submitted piece is reviewed by a moderator before it appears in the library.": { am: "ረቂቆች የግል ሆነው ይቆያሉ። የቀረበ ጽሑፍ በቤተ-መጻሕፍቱ ከመታየቱ በፊት በአወያይ ይገመገማል።", ti: "ረቂቕ ብውልቃዊ ይጸንሑ። ዝቐረበ ጽሑፍ ቅድሚ ኣብ ቤተ-መጻሕፍቲ ምርኣይ ብኣወያይ ይግምገም።", om: "Barreeffamni gabaabaa dhuunfaa ta'a. Barreeffamni dhiyaate dhiyeessii moderaatorin dura madaalama.", so: "Qabyaha waa kuwo gaar ah. Qoraal la gudbiyay waa la eegaa moderaatorka ka hor inta aanu maktabadda ku soo muuqan." },
    "Log in to see your submissions.": { am: "ማስገቢያዎችዎን ለማየት ይግቡ።", ti: "ምልኣኽታትካ ንምርኣይ እቶ።", om: "Galmeewwan kee ilaaluuf seeni.", so: "Gal si aad u aragto gudbinadaada." },
    "Your drafts and submissions, with the status and any feedback from moderators.": { am: "ረቂቆችዎ እና ማስገቢያዎችዎ፣ ከሁኔታ እና ከአወያዮች አስተያየት ጋር።", ti: "ረቂቕካትን ምልኣኽታትካን፣ ብሕቶን ካብ ኣወያይቲ ዝመጸ ኣስተያየትን።", om: "Barreeffamoota fi galmee kee, haala isaa fi yaada moderaatoota wajjin.", so: "Qabyaha iyo gudbinadaada, oo leh xaaladda iyo jawaabta moderaatorada." },
    "Loading…": { am: "በመጫን ላይ…", ti: "ይጽዓን ኣሎ…", om: "Fe'amaa jira…", so: "Wuu soo socdaa…" },
    "PDF only, up to 10 MB. You can save a draft without a PDF.": { am: "PDF ብቻ፣ እስከ 10 MB። ያለ PDF ረቂቅ ማስቀመጥ ይችላሉ።", ti: "PDF ጥራይ፣ ክሳብ 10 MB። ብዘይ PDF ረቂቕ ክትዓቅብ ትኽእል።", om: "PDF qofa, hanga 10 MB. PDF malee barreeffama kuusuu dandeessa.", so: "PDF kaliya, ilaa 10 MB. Qabyo waad kaydin kartaa iyada oo aanu PDF lahayn." },
    "Upload PDF (required to submit)": { am: "PDF ጫን (ለማስገባት ያስፈልጋል)", ti: "PDF ጸዓን (ንምልኣኽ ኣድላይ)", om: "PDF olkaa'i (galchuuf barbaachisa)", so: "PDF soo rar (waa loo baahan yahay si loo gudbiyo)" },
    "Title": { am: "ርዕስ", ti: "ብርእስ", om: "Mata-duree", so: "Cinwaan" },
    "Publication type": { am: "የህትመት ዓይነት", ti: "ዓይነት ሕታም", om: "Gosa maxxansaa", so: "Nooca daabacaadda" },
    "Research field or subject": { am: "የምርምር መስክ ወይም ርዕስ", ti: "ናይ ምርምር መስክ ወይ ርእሲ", om: "Fagoo qorannoo ykn mata-duree", so: "Goobta cilmi-baadhista ama mawduuca" },
    "Abstract or summary": { am: "ማጠቃለያ ወይም ሐተታ", ti: "ጽንጥሎ ወይ ሓፈሻዊ ሓበሬታ", om: "Cuunfaa ykn gabaabinsa", so: "Soo koobid ama kooban" },
    "Keywords": { am: "ቁልፍ ቃላት", ti: "ቁልፍ ቃላት", om: "Jechoota furmaataa", so: "Ereyada muhiimka ah" },
    "Language": { am: "ቋንቋ", ti: "ቋንቋ", om: "Afaan", so: "Luqadda" },
    "Institution or affiliation (optional)": { am: "ተቋም ወይም ትስስር (ከተፈለገ)", ti: "ተቓውሞ ወይ ርክብ (ኣድላይ እንተኾነ)", om: "Dhaabbata ykn walitti dhufeenya (filannoo)", so: "Hay'adda ama xiriirka (ikhtiyaari)" },
    "Co-authors (optional)": { am: "ተባባሪ ደራሲያን (ከተፈለገ)", ti: "ተሻሪኽ ጸሓፍቲ (ኣድላይ እንተኾነ)", om: "Barreessitoota wal'aansoo (filannoo)", so: "Qorayaasha iskaashiga (ikhtiyaari)" },
    "References or bibliography": { am: "ማጣቀሻዎች ወይም መጽሐፍ ዝርዝር", ti: "ማእከታት ወይ ዝርዝር መጻሕፍቲ", om: "Wabii ykn tarree kitaabaa", so: "Tixraacyada ama liiska buugaagta" },
    "I declare that this work is my own (or my co-authors' with consent), that I have permission to publish it, and that I have cited my sources.": { am: "ይህ ሥራ የራሴ (ወይም የተባባሪዎቼ በስምምነት) መሆኑን፣ ለማተም ፈቃድ እንዳለኝና ምንጮቼን እንደጠቀስኩ አረጋግጣለሁ።", ti: "እዚ ስራሕ ናተይ (ወይ ናይ ሽርክነተይ ብፍቓድ) ምዃኑን፣ ንምሕታም ፍቓድ ከም ዘለኒን ምንጭታተይ ከም ጠቐስኩን ኣረጋግጽ።", om: "Hojiin kun kan koo (ykn kan hirmaattota koo ammanaadhaan) ta'uu, maxxansuuf hayyama akka qabu, madda koo akka ka'een nan mirkaneessa.", so: "Shaqadan waa shaqadayda (ama shaqaalaha wada-shaqaynta oo oggolaansho leh), waxaana haysta ogolaansho daabacaadda, waxaana tilmaamay ilaahayaga." },
    "Current events, analysis, and essays": { am: "የወቅቱ ጉዳዮች፣ ትንታኔ እና ድርሰቶች", ti: "ናይ ሕጂ ጉዳያት፣ ትንተናን ኣርእስቲን", om: "Taateewwan ammaa, xiinxala fi barruu", so: "Dhacdooyinka hadda, falanqeyn iyo maqaalo" },
    "News and Journal are separate from the": { am: "ዜና እና ጆርናል ከ", ti: "ዜናን ጆርናልን ካብ", om: "Oduu fi Joornaalli irraa", so: "Warar iyo Joornaal waxay ka madax banaan yihiin" },
    ", which is for research papers and theses.": { am: "፣ ይህ ለምርምር ወረቀቶች እና ጥናቶች ነው።", ti: "፣ እዚ ንናይ ምርምር ጽሑፋትን ጥናታትን እዩ።", om: ", kun barreeffamoota qorannoo fi qorannoo digirii ta'a.", so: ", taas waa cilmi-baadhista iyo tesisyada." },
    "Items are submitted by members and checked by moderators before they appear. They are not verified news reports, so check the original source for news.": { am: "ንጥሎች በአባላት ይቀርባሉ፣ ከመታየታቸው በፊት በአወያዮች ይመረመራሉ። የተረጋገጡ የዜና ዘገባዎች አይደሉም፣ ስለዚህ ለዜና የመጀመሪያውን ምንጭ ያረጋግጡ።", ti: "ንጥልታት ብኣባላት ይቐርቡ፣ ቅድሚ ምርኣዮም ብኣወያይቲ ይምርመሩ። ዝተረጋገጹ ዜናታት ኣይኮኑን፣ ስለዚ ንዜና ቀዳማይ ምንጪ ርአ።", om: "Meeshaaleen miseensoota dhiyeessan, dura mul'atanii moderaatotaan madaalamu. Oduu mirkanaa'e miti, kanaaf madda jalqabaa mirkaneessi.", so: "Waxyaabaha xubnaha ayaa soo gudbiya, waxayna eegaan moderaatorada ka hor inta aan la muujin. Warar la xaqiijiyay ma aha, sidaas darteed hubi isha asalka ah." },
    "Drafts stay private. Submitted items are reviewed by a moderator before they appear here.": { am: "ረቂቆች የግል ሆነው ይቆያሉ። የቀረቡ ንጥሎች ከመታየታቸው በፊት በአወያይ ይገመገማሉ።", ti: "ረቂቕ ብውልቃዊ ይጸንሑ። ዝቐረቡ ንጥልታት ቅድሚ ምርኣዮም ብኣወያይ ይግምገሙ።", om: "Barreeffamni gabaabaa dhuunfaa ta'a. Meeshaaleen dhiyaatan dura mul'atanii moderaatorin madaalama.", so: "Qabyaha waa kuwo gaar ah. Waxyaabaha la gudbiyay waa la eegaa moderaatorka ka hor inta aan halkan lagu muujin." },
    "Journal: an opinion piece, analysis, or essay": { am: "ጆርናል፡ የአስተያየት ጽሑፍ፣ ትንታኔ ወይም ድርሰት", ti: "ጆርናል፡ ናይ ርእይቶ ጽሑፍ፣ ትንተና ወይ ኣርእስቲ", om: "Joornaala: barruu ilaalcha, xiinxala ykn barruu", so: "Joornaal: maqaal fikrad, falanqeyn ama qoraal" },
    "News: a timely update with its source": { am: "ዜና፡ በጊዜው የተዘጋጀ መረጃ ከምንጩ ጋር", ti: "ዜና፡ ብግዜኡ ዝተዋህበ ሓበሬታ ምስ ምንጩ", om: "Oduu: odeeffannoo yeroodhaan madda isaa wajjin", so: "Warar: war cusub oo leh isha" },
    "Summary": { am: "ማጠቃለያ", ti: "ጽንጥሎ", om: "Cuunfaa", so: "Soo koobid" },
    "Topic": { am: "ርዕሰ ጉዳይ", ti: "ርእሲ", om: "Mata-duree", so: "Mawduuc" },
    "Type": { am: "ዓይነት", ti: "ዓይነት", om: "Gosa", so: "Nooca" },
    "Cover image (optional: JPG, PNG or WebP, 5 MB or smaller)": { am: "የሽፋን ምስል (አማራጭ፡ JPG፣ PNG ወይም WebP፣ እስከ 5 MB)", ti: "ናይ ሽፋን ስእሊ (ኣማራጺ፡ JPG፣ PNG ወይ WebP፣ ክሳብ 5 MB)", om: "Suuraa kaaftoo (filannoo: JPG, PNG ykn WebP, hanga 5 MB)", so: "Sawirka dahaadhka (ikhtiyaari: JPG, PNG ama WebP, ilaa 5 MB)" },
    "Source name": { am: "የምንጩ ስም", ti: "ስም ምንጪ", om: "Maqaa madda", so: "Magaca isha" },
    "Source web address": { am: "የምንጩ ድረ-ገጽ አድራሻ", ti: "ኣድራሻ ዌብ ምንጪ", om: "Teessoo wab-saayitii madda", so: "Cinwaanka websaydhka isha" },
    "What are you submitting?": { am: "ምን እያስገቡ ነው?", ti: "እንታይ ትእቱ?", om: "Maal dhiyeessaa jirta?", so: "Maxaad soo gudbinaysaa?" },
    "Moderator review queue: news and journal": { am: "የአወያይ ግምገማ ወረፋ፡ ዜና እና ጆርናል", ti: "ሰልፊ ምርመራ ኣወያዪ፡ ዜናን ጆርናልን", om: "Jiruu madaalii moderaatotaa: oduu fi joornaala", so: "Safka dib-u-eegista moderaatorka: warar iyo joornaal" },
    "Visible to moderators only. Each decision is recorded with your name and the time.": { am: "ለአወያዮች ብቻ የሚታይ። እያንዳንዱ ውሳኔ በስምዎ እና በጊዜው ይመዘገባል።", ti: "ንኣወያይቲ ጥራይ ዝርአ። ነፍሲ ወከፍ ውሳኔ ብስምካን ብግዜኡ ይዝከር።", om: "Moderaatota qofaaf mul'ata. Murtii tokkoo tokkoo maqaa keetii fi yeroo isaatiin galmaa'a.", so: "Moderaatorka keliya ayaa arki kara. Go'aan kasta magacaaga iyo waqtigiisa ayaa lagu diiwaangeliyaa." },
    "Recent timely updates, most recent first.": { am: "የቅርብ ጊዜ ዜናዎች፣ በቅርብ ጊዜ የመጡ መጀመሪያ።", ti: "ናይ ቀረባ ግዜ ዜናታት፣ ቀረብ ዝበሉ ቀዳምነት።", om: "Odeeffannoo yeroodhaan dhiyoo, kan dhiyoo dura.", so: "Wararka cusub ee ugu dambeeyay marka hore." },
    "The most recent approved journal article.": { am: "በጣም የቅርብ ጊዜ የጸደቀ የጆርናል ጽሑፍ።", ti: "ዝቐረበ ግዜ ዝጸደቐ ናይ ጆርናል ጽሑፍ።", om: "Barruu joornaalaa yeroo dhiyoo mirkanaa'e.", so: "Maqaalka joornaalka ee ugu dambeeya ee la ansixiyay." },
    "Opinion, analysis, and essays from the community.": { am: "ከማኅበረሰቡ የአስተያየት፣ ትንታኔ እና ድርሰቶች።", ti: "ካብ ማሕበረሰብ ርእይቶን ትንተናን ኣርእስትን።", om: "Ilaalcha, xiinxala fi barruu bulshaa.", so: "Fikrad, falanqeyn iyo maqaalo bulshada." },
    "Timely updates and commentary on politics, international relations, diplomacy, governance, and Ethiopian and African affairs.": { am: "በፖለቲካ፣ ዓለም አቀፍ ግንኙነት፣ ዲፕሎማሲ፣ አስተዳደር እና በኢትዮጵያ እና በአፍሪካ ጉዳዮች ላይ ወቅታዊ መረጃዎችና አስተያየቶች።", ti: "ኣብ ፖለቲካ፣ ዓለም-ለኻዊ ርክብ፣ ዲፕሎማስን ምምሕዳርን ናይ ኢትዮጵያን ኣፍሪቃን ጉዳያትን ብግዜኡ ሓበሬታን ርእይቶን።", om: "Odeeffannoo yeroodhaan fi yaada siyaasa, walqunnamtii addunyaa, diplomaasii, bulchiinsa, fi qabiyyee Itoophiyaa fi Afrikaa irratti.", so: "Warar iyo faallo ku saabsan siyaasadda, xiriirka caalamka, diblomaasiyadda, maamulka iyo arrimaha Itoobiya iyo Afrika." },
    // Research Hub, News & Journal and category text: drafts for Tigrinya, Afaan Oromo and Af Somali pending native-speaker review.
  };

  const LANGS = [["en", "English"], ["am", "አማርኛ"], ["ti", "ትግርኛ"], ["om", "Afaan Oromoo"], ["so", "Af Soomaali"]];
  const KEY = "psir-language";

  const DICT = { am: {}, ti: {}, om: {}, so: {} };
  Object.keys(AM_BASE).forEach(k => { DICT.am[k] = AM_BASE[k]; });
  Object.keys(EXTRA).forEach(k => {
    if (EXTRA[k].am) DICT.am[k] = EXTRA[k].am;
    DICT.ti[k] = EXTRA[k].ti;
    DICT.om[k] = EXTRA[k].om;
    DICT.so[k] = EXTRA[k].so;
  });
  // Longest phrases first, so "Log in" is not split by "Log"
  const KEYS = {};
  Object.keys(DICT).forEach(l => { KEYS[l] = Object.keys(DICT[l]).sort((a, b) => b.length - a.length); });

  const originals = new WeakMap();
  const esc = s => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

  function translateNode(node, lang) {
    const raw = node.nodeValue;
    if (!raw || !raw.trim()) return;
    let source = originals.get(node);
    if (source === undefined) { source = raw; originals.set(node, source); }
    let out = source;
    if (lang !== "en") {
      (KEYS[lang] || []).forEach(k => {
        // Whole words only for Latin text, so "Light" does not change "Lightning"
        const re = new RegExp("(^|[^A-Za-z])" + esc(k) + "(?![A-Za-z])", "g");
        out = out.replace(re, (m, pre) => pre + DICT[lang][k]);
      });
    }
    if (out !== node.nodeValue) node.nodeValue = out;
  }

  function walk(root, lang) {
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode: n => (n.parentElement && n.parentElement.closest("script,style,textarea,input,select,option,#psirLang"))
        ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT
    });
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach(n => translateNode(n, lang));
  }

  let lang = "en";
  try { lang = localStorage.getItem(KEY) || "en"; } catch (e) {}
  if (!DICT[lang] && lang !== "en") lang = "en";

  function apply() {
    document.documentElement.lang = lang;
    walk(document.body, lang);
    const sel = document.getElementById("psirLang");
    if (sel) sel.value = lang;
  }

  function addSelector() {
    const host = document.getElementById("navActions") || document.querySelector(".nav-actions") ||
                 document.querySelector("header .top-inner") || document.querySelector(".top-inner") || document.querySelector("header");
    if (!host || document.getElementById("psirLang")) return;
    const sel = document.createElement("select");
    sel.id = "psirLang";
    sel.setAttribute("aria-label", "Language");
    LANGS.forEach(([code, label]) => {
      const o = document.createElement("option");
      o.value = code;
      o.textContent = label;
      sel.appendChild(o);
    });
    sel.addEventListener("change", () => {
      lang = sel.value;
      try { localStorage.setItem(KEY, lang); } catch (e) {}
      apply();
    });
    host.appendChild(sel);
  }

  addSelector();
  apply();
  // Text that appears later (lists, dialogs) follows the chosen language
  new MutationObserver(records => {
    // The header is redrawn after sign-in or sign-out, which removes the selector: put it back
    if (!document.getElementById("psirLang")) {
      addSelector();
      const sel = document.getElementById("psirLang");
      if (sel) sel.value = lang;
    }
    if (lang === "en") return;
    records.forEach(r => r.addedNodes.forEach(n => {
      if (n.nodeType === 3) translateNode(n, lang);
      else if (n.nodeType === 1 && n.id !== "psirLang") walk(n, lang);
    }));
  }).observe(document.body, { childList: true, subtree: true });
})();
