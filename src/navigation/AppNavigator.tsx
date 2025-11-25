import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';

// Existing Screens
import HomeScreen from '../screens/HomeScreen';
import SocialScreen from '../screens/SocialScreen';
import CreateMomentScreen from '../screens/CreateMomentScreen';
import MomentDetailScreen from '../screens/MomentDetailScreen';
import ActivityScreen from '../screens/ActivityScreen';
import ProfileScreen from '../screens/ProfileScreen';

// Onboarding & Auth
import { OnboardingScreen } from '../screens/OnboardingScreen';
import { WelcomeScreen } from '../screens/WelcomeScreen';
import { PhoneAuthScreen } from '../screens/PhoneAuthScreen';
import { EmailAuthScreen } from '../screens/EmailAuthScreen';
import { CompleteProfileScreen } from '../screens/CompleteProfileScreen';

// Proof System
import { ProofWalletScreen } from '../screens/ProofWalletScreen';
import { ProofUploadScreen } from '../screens/ProofUploadScreen';
import { ProofStoryScreen } from '../screens/ProofStoryScreen';
import { ProofDetailScreen } from '../screens/ProofDetailScreen';
import { PostProofSuccessScreen } from '../screens/PostProofSuccessScreen';

// Approval & Matching
import { ReceiverApprovalScreenV2 } from '../screens/ReceiverApprovalScreenV2';
import { MatchConfirmationScreen } from '../screens/MatchConfirmationScreen';

// Communication
import { ChatScreen } from '../screens/ChatScreen';

// Transactions
import { TransactionDetailScreen } from '../screens/TransactionDetailScreen';
import { RefundPolicyScreen } from '../screens/RefundPolicyScreen';
import { RefundRequestScreen } from '../screens/RefundRequestScreen';

// Settings & Subscription
import { SubscriptionScreen } from '../screens/SubscriptionScreen';

// Support & Help
import { SupportScreen } from '../screens/SupportScreen';
import { FAQScreen } from '../screens/FAQScreen';

// Profile
import { ProfileDetailScreen } from '../screens/ProfileDetailScreen';

import { Moment } from '../types';

export type RootStackParamList = {
  // Onboarding & Auth
  Onboarding: undefined;
  Welcome: undefined;
  SocialLogin: undefined;
  PhoneAuth: undefined;
  EmailAuth: undefined;
  CompleteProfile: undefined;
  
  // Main App
  Home: undefined;
  Social: undefined;
  CreateMoment: undefined;
  MomentDetail: { moment: Moment };
  Activity: undefined;
  Profile: undefined;
  ProfileDetail: { userId: string };
  
  // Proof System
  ProofWallet: undefined;
  ProofUpload: undefined;
  ProofStory: { proofId: string };
  ProofDetail: { proofId: string };
  PostProofSuccess: { proofId: string };
  
  // Approval & Matching
  ReceiverApprovalV2: { momentTitle: string; totalAmount: number };
  MatchConfirmation: { selectedGivers: any[] };
  
  // Communication
  Chat: { otherUser: any };
  
  // Transactions
  TransactionDetail: { transactionId: string };
  RefundPolicy: undefined;
  RefundRequest: { transactionId: string };
  
  // Settings
  Subscription: undefined;
  Support: undefined;
  FAQ: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();

const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Onboarding"
        screenOptions={{
          headerShown: false,
          cardStyleInterpolator: ({ current: { progress } }) => ({
            cardStyle: {
              opacity: progress,
            },
          }),
          transitionSpec: {
            open: {
              animation: 'timing',
              config: {
                duration: 200,
              },
            },
            close: {
              animation: 'timing',
              config: {
                duration: 200,
              },
            },
          },
        }}
      >
        {/* Onboarding & Auth */}
        <Stack.Screen name="Onboarding" component={OnboardingScreen} />
        <Stack.Screen name="Welcome" component={WelcomeScreen} />
        <Stack.Screen name="SocialLogin" component={require('../screens/SocialLoginScreen').default} />
        <Stack.Screen name="PhoneAuth" component={PhoneAuthScreen} />
        <Stack.Screen name="EmailAuth" component={EmailAuthScreen} />
        <Stack.Screen name="CompleteProfile" component={CompleteProfileScreen} />
        
        {/* Main App */}
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Social" component={SocialScreen} />
        <Stack.Screen name="CreateMoment" component={CreateMomentScreen} />
        <Stack.Screen name="MomentDetail" component={MomentDetailScreen} />
        <Stack.Screen name="Activity" component={ActivityScreen} />
        <Stack.Screen name="Profile" component={ProfileScreen} />
        <Stack.Screen name="ProfileDetail" component={ProfileDetailScreen} />
        
        {/* Proof System */}
        <Stack.Screen name="ProofWallet" component={ProofWalletScreen} />
        <Stack.Screen name="ProofUpload" component={ProofUploadScreen} />
        <Stack.Screen name="ProofStory" component={ProofStoryScreen} />
        <Stack.Screen name="ProofDetail" component={ProofDetailScreen} />
        <Stack.Screen name="PostProofSuccess" component={PostProofSuccessScreen} />
        
        {/* Approval & Matching */}
        <Stack.Screen name="ReceiverApprovalV2" component={ReceiverApprovalScreenV2} />
        <Stack.Screen name="MatchConfirmation" component={MatchConfirmationScreen} />
        
        {/* Communication */}
        <Stack.Screen name="Chat" component={ChatScreen} />
        
        {/* Transactions */}
        <Stack.Screen name="TransactionDetail" component={TransactionDetailScreen} />
        <Stack.Screen name="RefundPolicy" component={RefundPolicyScreen} />
        <Stack.Screen name="RefundRequest" component={RefundRequestScreen} />
        
        {/* Settings */}
        <Stack.Screen name="Subscription" component={SubscriptionScreen} />
        <Stack.Screen name="Support" component={SupportScreen} />
        <Stack.Screen name="FAQ" component={FAQScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
