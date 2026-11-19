import { SignGesture } from '../types';

export const SUPPORTED_GESTURES: SignGesture[] = [
  {
    id: 'hello',
    word: 'Hello',
    category: 'Greeting',
    shortCue: 'Open upright palm with all five fingers spread wide',
    description:
      'Raise your hand upright facing the camera with all five fingers fully extended and spread gently apart.',
    detectionRule:
      'All four fingers extended upright, thumb extended outward, and wide spacing between adjacent fingertips.',
    imageUrl: '/src/assets/images/sign_hello_1795112776408.jpg',
  },
  {
    id: 'welcome',
    word: 'Welcome',
    category: 'Greeting',
    shortCue: 'Open flat hand pointing downward with fingers extended',
    description:
      'Hold your open hand with all fingers extended straight downward in a gentle welcoming sweep.',
    detectionRule:
      'All four fingers extended with the hand axis oriented downward.',
    imageUrl: '/src/assets/images/sign_welcome_1795114153465.jpg',
  },
  {
    id: 'thank_you',
    word: 'Thank You',
    category: 'Politeness',
    shortCue: 'Flat open hand angled sideways or extended outward',
    description:
      'Hold your four fingers straight together and angle your flat hand horizontally outward in front of the camera, echoing the forward motion from the chin.',
    detectionRule:
      'Four fingers extended straight with the hand axis angled horizontally rather than straight vertical.',
    imageUrl: '/src/assets/images/sign_thank_you_1795112800116.jpg',
  },
  {
    id: 'please',
    word: 'Please',
    category: 'Politeness',
    shortCue: 'Flat upright hand with four fingers pressed tightly together',
    description:
      'Hold your hand upright facing the camera with all four fingers extended straight and pressed tightly side by side without gaps.',
    detectionRule:
      'All four fingers extended upright with narrow spacing between adjacent fingertips.',
    imageUrl: '/src/assets/images/sign_please_1795112777381.jpg',
  },
  {
    id: 'yes',
    word: 'Yes',
    category: 'Response',
    shortCue: 'Closed upright fist with thumb tucked across fingers',
    description:
      'Curl all four fingers into a firm closed fist with your thumb resting neatly across the front of your curled fingers.',
    detectionRule:
      'All four fingertips curled below their middle joints while the thumb stays folded across the fist.',
    imageUrl: '/src/assets/images/sign_yes_1795112784104.jpg',
  },
  {
    id: 'no',
    word: 'No',
    category: 'Response',
    shortCue: 'Index and middle fingers held together; ring and pinky curled',
    description:
      'Extend your index and middle fingers pressed together (or angled toward your thumb) while keeping your ring and pinky fingers folded into your palm.',
    detectionRule:
      'Index and middle fingers extended closely together with ring and pinky curled down.',
    imageUrl: '/src/assets/images/sign_no_1795112790485.jpg',
  },
  {
    id: 'ok',
    word: 'OK',
    category: 'Response',
    shortCue: 'Thumb and index tips pinched in a circle; other three fingers up',
    description:
      'Touch your thumb tip and index fingertip together to form a neat circle while extending your middle, ring, and pinky fingers upright.',
    detectionRule:
      'Thumb and index tips touching closely while middle, ring, and pinky fingers stay extended.',
    imageUrl: '/src/assets/images/sign_ok_1795114140808.jpg',
  },
  {
    id: 'bad',
    word: 'Bad',
    category: 'Response',
    shortCue: 'Thumbs-down with four fingers curled tightly',
    description:
      'Curl all four fingers cleanly into a fist and point your thumb straight downward toward the bottom of the frame.',
    detectionRule:
      'Four fingers curled into the palm while the thumb tip drops clearly below the index knuckle.',
    imageUrl: '/src/assets/images/sign_bad_1795114146985.jpg',
  },
  {
    id: 'i_love_you',
    word: 'I Love You',
    category: 'Expression',
    shortCue: 'Thumb, index, and pinky extended; middle and ring folded',
    description:
      'Face your palm toward the camera with your thumb, index finger, and pinky finger extended while folding your middle and ring fingers down.',
    detectionRule:
      'Thumb, index, and pinky tips extended outward while middle and ring fingertips remain curled.',
    imageUrl: '/src/assets/images/sign_i_love_you_1795112858717.jpg',
  },
  {
    id: 'peace',
    word: 'Peace',
    category: 'Expression',
    shortCue: 'Index and middle fingers spread wide in a V shape',
    description:
      'Face your palm forward and raise your index and middle fingers spread clearly apart in a V shape while folding your ring, pinky, and thumb.',
    detectionRule:
      'Index and middle fingers extended and spread apart while thumb, ring, and pinky remain curled.',
    imageUrl: '/src/assets/images/sign_peace_1795114114481.jpg',
  },
  {
    id: 'awesome',
    word: 'Awesome',
    category: 'Expression',
    shortCue: 'Index and pinky up; thumb tucked across curled middle and ring',
    description:
      'Extend your index and pinky fingers straight upward while keeping your middle and ring fingers folded with your thumb tucked cleanly over them.',
    detectionRule:
      'Index and pinky extended while middle, ring, and thumb stay tucked inward.',
    imageUrl: '/src/assets/images/sign_awesome_1795114157990.jpg',
  },
  {
    id: 'promise',
    word: 'Promise',
    category: 'Expression',
    shortCue: 'Only pinky finger extended straight upward',
    description:
      'Raise only your pinky finger straight up while keeping your index, middle, ring, and thumb neatly curled into your palm.',
    detectionRule:
      'Pinky finger extended upright with thumb, index, middle, and ring curled.',
    imageUrl: '/src/assets/images/sign_promise_1795114112706.jpg',
  },
  {
    id: 'help',
    word: 'Help',
    category: 'Assistance',
    shortCue: 'Thumbs-up upright with four fingers curled tightly',
    description:
      'Curl all four fingers cleanly into a fist while pointing your thumb straight upward toward the top of the frame.',
    detectionRule:
      'Four fingers curled into the palm while the thumb tip rises clearly above the index knuckle.',
    imageUrl: '/src/assets/images/sign_help_1795112885372.jpg',
  },
  {
    id: 'water',
    word: 'Water',
    category: 'Everyday',
    shortCue: 'Three middle fingers up in a W shape; thumb holds pinky down',
    description:
      'Extend your index, middle, and ring fingers straight upward to form the ASL "W" handshape while curling your pinky and thumb.',
    detectionRule:
      'Index, middle, and ring fingers extended while pinky and thumb remain folded.',
    imageUrl: '/src/assets/images/sign_water_1795114149800.jpg',
  },
  {
    id: 'call_me',
    word: 'Call Me',
    category: 'Everyday',
    shortCue: 'Thumb and pinky extended wide like a telephone',
    description:
      'Extend both your thumb and pinky finger outward in a telephone handshape while curling your index, middle, and ring fingers into the palm.',
    detectionRule:
      'Thumb and pinky extended wide while index, middle, and ring fingers are curled.',
    imageUrl: '/src/assets/images/sign_call_me_1795114144901.jpg',
  },
  {
    id: 'later',
    word: 'Later',
    category: 'Everyday',
    shortCue: 'Thumb out to the side and index straight up forming an L',
    description:
      'Form the ASL "L" handshape by extending your index finger straight upward and your thumb outward to the side while curling your other three fingers.',
    detectionRule:
      'Index finger pointing upward with thumb extended sideways; middle, ring, and pinky curled.',
    imageUrl: '/src/assets/images/sign_later_1795114139334.jpg',
  },
  {
    id: 'three',
    word: 'Three',
    category: 'Everyday',
    shortCue: 'Thumb, index, and middle extended (ASL 3); ring and pinky curled',
    description:
      'Face your palm forward and extend your thumb, index finger, and middle finger outward while folding your ring and pinky fingers down.',
    detectionRule:
      'Thumb, index, and middle fingers extended while ring and pinky remain curled.',
    imageUrl: '/src/assets/images/sign_three_1795114144566.jpg',
  },
  {
    id: 'wait',
    word: 'Wait',
    category: 'Actions',
    shortCue: 'Single index finger pointing straight upward',
    description:
      'Hold up only your index finger pointing straight toward the top of the frame while curling your other fingers and thumb.',
    detectionRule:
      'Only the index finger extended straight upward with thumb, middle, ring, and pinky curled.',
    imageUrl: '/src/assets/images/sign_wait_1795114113016.jpg',
  },
  {
    id: 'go',
    word: 'Go',
    category: 'Actions',
    shortCue: 'Single index finger pointing horizontally sideways',
    description:
      'Turn your hand sideways and point your index finger horizontally left or right while curling your middle, ring, and pinky fingers.',
    detectionRule:
      'Only the index finger extended along a horizontal axis with middle, ring, and pinky curled.',
    imageUrl: '/src/assets/images/sign_go_1795114114073.jpg',
  },
  {
    id: 'here',
    word: 'Here',
    category: 'Actions',
    shortCue: 'Single index finger pointing straight downward',
    description:
      'Point your index finger clearly downward toward the bottom of the frame while folding your middle, ring, and pinky fingers.',
    detectionRule:
      'Only the index finger extended straight downward with middle, ring, and pinky curled.',
    imageUrl: '/src/assets/images/sign_here_1795114142932.jpg',
  },
];
