import React, { useEffect, useRef, useState } from 'react';
import { Dimensions, StyleSheet, TouchableWithoutFeedback, View, StatusBar } from 'react-native';
import HeaderBar from './HeaderBar';
import SidebarMenu from './SidebarMenu';
import SupportFab from '../utility/SupportFab';
import BottomTabs from './BottomTabs';
import COLORS from '../../theme/colors';

const AppShell = ({ children, hideChrome = false, hideSupport = false, title }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [statusHidden, setStatusHidden] = useState(false);
  const timerRef = useRef(null);

  const resetTimer = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    setStatusHidden(false);
    timerRef.current = setTimeout(() => {
      setStatusHidden(true);
    }, 3000);
  };

  useEffect(() => {
    resetTimer();
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  return (
    <View style={styles.container} onTouchStart={resetTimer}>
      <StatusBar
        hidden={statusHidden}
        backgroundColor="rgba(15, 23, 42, 0.35)"
        barStyle="light-content"
      />
      {!hideChrome && <HeaderBar onMenuPress={() => setIsMenuOpen(true)} title={title} />}
      <View style={styles.content}>{children}</View>
      {!hideSupport && <SupportFab />}
      <BottomTabs />

      {isMenuOpen && (
        <View style={styles.menuOverlayContainer}>
          <TouchableWithoutFeedback onPress={() => setIsMenuOpen(false)}>
            <View style={styles.backdrop} />
          </TouchableWithoutFeedback>
          <SidebarMenu onClose={() => setIsMenuOpen(false)} />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    flex: 1,
  },
  menuOverlayContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
    flexDirection: 'row',
    zIndex: 999,
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
  },
});

export default AppShell;
