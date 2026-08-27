import type { CloseReading } from '../types/closeReading';
import { cet4Set3ClozeCloseReadings } from './closeReading/cet4Set3Cloze';
import { cet4Set3MatchingCloseReadings } from './closeReading/cet4Set3Matching';
import { cet4Set3PassageOneCloseReadings } from './closeReading/cet4Set3PassageOne';
import { cet4Set3PassageTwoCloseReadings } from './closeReading/cet4Set3PassageTwo';

export const cet4CloseReadings202606Set3 = {
  ...cet4Set3ClozeCloseReadings,
  ...cet4Set3MatchingCloseReadings,
  ...cet4Set3PassageOneCloseReadings,
  ...cet4Set3PassageTwoCloseReadings,
} satisfies Record<string, CloseReading>;

export const cet4Reading202606Set3 = {
  cloze: {
    title: 'Why cutting back on junk food can feel like withdrawal',
    sentences: [
      'Junk-food lovers who try to cut back on fries or chocolate may experience symptoms similar to drug withdrawal, a new study suggests.',
      'Researchers found that people attempting to cut down on eating highly processed foods experience some of the same physical and psychological symptoms—such as mood swings, anxiety, headaches and poor sleep—as those quitting smoking cigarettes or using drugs, according to the study.',
      'The new study offers the first evidence that these withdrawal-like symptoms can occur when people cut down on highly processed foods, said lead study author Erica Schulte.',
      'Based on the participants’ self-reported symptoms, withdrawal symptoms were significantly more intense between the second and fifth days after attempting to reduce junk-food consumption, which parallels the time span people live through during drug withdrawal.',
      'The idea that food may be addictive after “heavy” use by some individuals is a controversial subject, Schulte said.',
      'Although prior studies in animals and humans have shown some biological and behavioral similarities between substance-use disorders and addictive-like consumption of highly processed foods, no studies have looked at whether reducing junk food can trigger withdrawal symptoms in people, she noted.',
      'Raising awareness that people may experience irritability (烦躁) or headaches when cutting down on junk food can help individuals prepare coping strategies in advance, Schulte noted.',
      'The findings may also shed light on the barriers people face when changing eating habits—barriers that may play a role in people dropping out of treatments, she said.',
    ],
  },
  matching: {
    title: 'Giving a better phone interview',
    paragraphs: [
      {
        label: 'A',
        sentences: [
          'These days, phone interviews are an unavoidable part of the job interview process, and for good reason: They save time and effort.',
          'But that doesn’t mean that phone calls require zero energy on the part of the candidate.',
          'Many companies treat phone screening as the official first round of the hiring process.',
          'That means candidates are expected to go into them prepared with as much information as possible about the company, position, and their own skills and strengths.',
        ],
      },
      {
        label: 'B',
        sentences: [
          'A big mistake people often make is talking about their personal lives.',
          'Don’t talk about your personal life unless you’re directly asked a question about what you like to do in your off-hours.',
          '“The point of a phone interview is to focus on getting to know a candidate’s professional experience and goals,” says Mckenzie Roark, campus talent specialist at Lithko Contracting.',
          '“A recruiter is trying to see if they are the best fit for a role, and learning about their personal life doesn’t help.',
          'For example, when asked where you see yourself in five years, we don’t want to know that you hope to be married or that you want to buy a new house.',
          'That is nice, but that isn’t relative to anything professional.”',
        ],
      },
      {
        label: 'C',
        sentences: [
          'It might be tempting to cross something off your to-do list while on a phone interview, but recruiters and hiring managers can easily tell if your attention is elsewhere.',
          'Many interviewers are annoyed to see people who decide to multitask while on the phone interview.',
          'There are candidates who wash dishes, go for walks, or do grocery shopping during the interview.',
          'Needless to say, this doesn’t reflect well on your level of interest in the position you’re interviewing for.',
        ],
      },
      {
        label: 'D',
        sentences: [
          'The question regarding pay is also best avoided.',
          'To be frank, it’s simply too early in the process for you to be the one who brings up salary expectations.',
          '“Chances are if a candidate is participating in a phone interview, this is the first time they have talked with the company, and the first call isn’t the appropriate time to talk about ‘what’s in it for you,’” says Justina Strnad, the Talent Acquisition Manager for Shiftgig.',
          '“Trust me, if you are a great candidate and make it to the next step, the hiring team is going to be very transparent about what’s in it for you later on.”',
        ],
      },
      {
        label: 'E',
        sentences: [
          '“After wrapping up a phone interview, it is typical that the interviewer will ask the candidate if they have any questions.',
          'I can’t stress this enough: ALWAYS ask questions,” says Roark.',
          '“If we have had a great phone interview and then we wrap up and they don’t have any questions for me, it pretty much ruins the whole interview.',
          'It tells me that the candidate is uninterested in the role, which in reality might not be the case at all,” she notes.',
          'But surely, if you’re interested in a job, you can think of something to ask your interviewer.',
        ],
      },
      {
        label: 'F',
        sentences: [
          'It seems basic, but surprisingly, a lot of people are late to phone interviews.',
          '“About a quarter of the people with whom I schedule phone interviews aren’t on time,” says Sophie Cikovsky, who handles U.S. recruiting for Infinite Global.',
          '“While this bothers me personally, it’s also indicative of someone who isn’t very detail-oriented,” she explains.',
          '“In order to identify this early in the hiring process, I started asking all candidates a few years ago to call me as opposed to calling them at an agreed-upon time.',
          'That way, if I hear from them at 1:13 p.m. or 12:49 p.m. instead of our planned 1:00 p.m. interview time, I have an early indicator that they might not be a great fit.”',
        ],
      },
      {
        label: 'G',
        sentences: [
          '“Make sure you test your headset and connection before dialing in,” recommends Roark.',
          '“There is nothing more frustrating for a recruiter who has a structured interview guide in place having to repeatedly ask the same question over and over because they could not understand your answer due to dropped signals.”',
          'Test-call a friend beforehand, or even call yourself from a landline if necessary; it will take less than a minute.',
        ],
      },
      {
        label: 'H',
        sentences: [
          'You might be eager to get your point across or talk about your experience, but interrupting the interviewer is awkward and rude.',
          '“Interviewing can be stressful, and sometimes that stress manifests itself in speaking too fast, speaking too loud, talking over the interviewer, or attempting to answer the interviewer’s question before they have actually finished asking the question,” says Chris Dardis, a recruiting expert.',
          '“Don’t do this.”',
          'There’s a big difference between being assertive (自信的) and being aggressive, and interviewers can always recognize it.',
        ],
      },
      {
        label: 'I',
        sentences: [
          'It’s tough not to say things like “um,” “uh,” and “like” in everyday speech, but these verbal habits become much more pronounced when speaking on the phone, says Dardis.',
          '“In face-to-face interviews, they’re not as noticeable, because there are other things like your hair, suit, or body language to distract people.',
          'But in a phone interview, the only thing you have to go on is what you say and how you say it.',
          'That’s why it’s so important to eliminate these words from your speech when doing a phone interview.”',
        ],
      },
      {
        label: 'J',
        sentences: [
          'Not knowing anything about the company or job you’re interviewing for is way more obvious than you’d think.',
          '“Many people think that they don’t have to put as much effort into researching the role or the company,” says Steve Pritchard, an HR consultant.',
          'And if you have your laptop in front of you during the interview to do a few quick searches, they won’t know the difference, right?',
          'Not exactly.',
          '“Seasoned interviewers will know whether an interviewee is researching while on the phone.',
          'The interviewer can often even hear the typing as they ask the question,” he adds.',
        ],
      },
      {
        label: 'K',
        sentences: [
          '“The key to success during a phone interview is clear and concise answers,” says Dardis.',
          '“People’s attention spans tend to be shorter over the phone.',
          'You don’t want your future employer to lose interest in the conversation.”',
          'He recommends practicing answers to questions you know will be asked ahead of time in order to be clear on what you’re going to say.',
          'That way, you can prevent talking in an aimless manner.',
        ],
      },
    ],
  },
  passages: [
    {
      title: 'Passage One · Physical and moral disgust',
      sentences: [
        'Disgust is a universal human emotion.',
        'One type of disgust is called physical disgust, which protects us from eating or touching things that could be dangerous for us, such as raw meat or insects.',
        'Children experience physical disgust from a very early age, but do not achieve an understanding of the concept until they are around four years old.',
        'Some researchers maintain that there is another type of disgust, called moral disgust, that protects us from engaging in activities that can be perceived as morally wrong.',
        'Examples of moral disgust are stealing, lying or cheating.',
        'However, not all academics think that moral disgust really exists.',
        'Some say that when we refer to disgust in relation to moral issues, we are using disgust as a metaphor (隐喻), and what we are feeling is in reality anger.',
        'If moral disgust appears quite late in development, it makes sense to think that there is actually a social component to it.',
        'Children learn about emotions in many different ways.',
        'Of special relevance are parents-children conversations about emotions.',
        'Indeed, children whose parents talk about emotions often have a better emotional understanding than children whose parents do not discuss emotions often.',
        'However, there are no studies that have examined how parents and children talk about disgust.',
        'This is what we set up to examine in our study.',
        'We asked 68 English-speaking mothers and their four-, six- or eight-year-old children to discuss some stories about moral and physical disgust.',
        'Our preliminary findings show mothers and children do talk about disgust, but mainly about physical disgust and not so much about moral disgust.',
        'When we asked mothers and children to discuss moral issues, such as whether it is OK to play with a child who has stolen someone else’s snack, they linked this type of moral wrongdoing with the emotion of anger and not disgust.',
        'Does this mean that moral disgust does not exist?',
        'Some researchers suggest moral disgust exists in adults.',
        'Our findings suggest that moral disgust is either understood at a later age or is only used metaphorically, if at all, in children as old as eight years.',
      ],
    },
    {
      title: 'Passage Two · When knowing a stranger changes behaviour',
      sentences: [
        'After finding out details about a stranger, we mistakenly think that they also know about us.',
        'As a result, we act more honestly around them, according to a recent study in Nature.',
        'Past research has found that we tend to assume social relationships are reciprocal (相互的).',
        'Most of the time, this assumption is accurate: someone you think of as a friend will usually consider you a friend too.',
        'But sometimes our social ties are more one-sided: for example, you might learn something about a stranger who doesn’t know you at all.',
        'Researchers Anuj Shah and Michael LaForest wondered whether our tendency to believe that social ties are reciprocal could lead us to mistakenly feel that a stranger does actually know us.',
        'In a series of lab-based studies, this is exactly what the researchers found.',
        'When we know about strangers, we erroneously think they also know about us.',
        'But the really interesting finding came when the researchers stepped out of the lab, to conduct a field experiment.',
        'The team developed leaflets (传单) containing fairly ordinary information about local community police officers, such as their favourite food, hobbies, or reasons for joining the police force.',
        'They then sent out these leaflets to every apartment in a number of housing developments in disadvantaged areas.',
        'The officers themselves also dropped off cards to local residents containing similar information.',
        'Two months later, the researchers surveyed residents at these housing developments as well as control areas that did not receive leaflets or outreach cards.',
        'Residents were asked to imagine that they had committed a crime and how likely it would be that local officers would find out about it.',
        'They also rated how well the officers in the area knew them.',
        'The team found that residents of the developments that had received the leaflets believed it more likely that local officers would find out about illegal activity than residents of the control areas.',
        'Even more strikingly, the team found that immediately after the leaflet distribution, there were fewer criminal complaints and arrests in the areas around the developments that had received the leaflets than around the control developments.',
      ],
    },
  ],
} as const;
