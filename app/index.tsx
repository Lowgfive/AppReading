import { View, Text, Pressable, StyleSheet, Animated, Dimensions, useWindowDimensions, Button } from 'react-native';
import { useContext, useRef, useState } from 'react';
import { Bold, Book, HomeIcon, Library, Menu, Search, User } from 'lucide-react-native';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { useAuth } from '@/context/AuthContext';
import { AppContext } from '@/context/AppContext';
import LoginScreen from './(auth)/login';
import { router } from 'expo-router';
import HomeScreen from './(tabs)/home';

export default function Home() {
  const { width } = useWindowDimensions();
  const isTablet = width >= 768;
  const { user, signOut } = useAuth();
  const app = useContext(AppContext)
  if (!app) return null
  const { openLogin, setOpenLogin } = app;



  return (
    <View style={styles.container}>
      <View style={isTablet ? styles.navTablet : styles.navMobile}>
        <View style={styles.navItems}>
          <Book color={"#eea322"} size={isTablet ? 20 : 16}></Book>
          <Text style={[styles.title, { fontSize: isTablet ? 20 : 16 }]}>StoryTime</Text>
        </View>
        <View style={styles.navItems}>
          <View >
            {isTablet ? <View style={styles.navTitle}>
              <View style={styles.navIcons}>
                <HomeIcon color={"white"} size={isTablet ? 14 : 8}></HomeIcon>
                <Text style={[styles.title, { fontSize: isTablet ? 18 : 12 }]}>Home</Text>
              </View>
              <View style={styles.navIcons}>
                <Search color={"white"} size={isTablet ? 14 : 8}></Search>
                <Text style={[styles.title, { fontSize: isTablet ? 18 : 12 }]}>Search</Text>
              </View>
              <View style={styles.navIcons}>
                <Library color={"white"} size={isTablet ? 14 : 8}></Library>
                <Text style={[styles.title, { fontSize: isTablet ? 18 : 12 }]}>Library</Text>
              </View>
              <View>
                <User color={"white"} size={isTablet ? 14 : 8}></User>
                <Text style={[styles.title, { fontSize: isTablet ? 18 : 12 }]}>Profile</Text>
              </View>
            </View> : <View></View>}
          </View>
        </View>
        <View>
          {user === null ? <Button title='Sign In' color={'#eea322'}
            onPress={() => { router.push('/login') }}></Button>
            : <Button title='Logout' color={'#eea322'}>
            </Button>
          }
        </View>
      </View>
      <View>
          <HomeScreen></HomeScreen>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  navMobile: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#eea322',
    paddingVertical: 12,
  },
  navTablet: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#eea322',
    paddingVertical: 12,
  },
  navItems: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  navTitle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: '9%'
  },
  navIcons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontWeight: '400',
    color: 'white',
  },
});
