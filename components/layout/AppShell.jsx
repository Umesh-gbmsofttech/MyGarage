import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Dimensions, Keyboard, PanResponder, StyleSheet, TouchableWithoutFeedback, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import HeaderBar from './HeaderBar';
import SidebarMenu from './SidebarMenu';
import SupportFab from '../utility/SupportFab';
import BottomTabs from './BottomTabs';
import COLORS from '../../theme/colors';

const AppShell = ({ children, hideChrome = false, hideSupport = false, title }) => {
  const insets = useSafeAreaInsets();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [keyboardOpen, setKeyboardOpen] = useState(false);
  const [statusBarHidden, setStatusBarHidden] = useState(true);
  const hideTimerRef = useRef(null);

  useEffect(() => {
    const keyboardShow = Keyboard.addListener('keyboardDidShow', () => setKeyboardOpen(true));
    const keyboardHide = Keyboard.addListener('keyboardDidHide', () => setKeyboardOpen(false));
    return () => {
      keyboardShow.remove();
      keyboardHide.remove();
      if (hideTimerRef.current) {
        clearTimeout(hideTimerRef.current);
      }
    };
  }, []);

  const showStatusBarTemporarily = () => {
    setStatusBarHidden(false);
    if (hideTimerRef.current) {
      clearTimeout(hideTimerRef.current);
    }
    hideTimerRef.current = setTimeout(() => {
      setStatusBarHidden(true);
    }, 1200);
  };

  const topPullResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => false,
        onMoveShouldSetPanResponderCapture: (_evt, gestureState) => {
          const movingDown = gestureState.dy > 14;
          const mostlyVertical = Math.abs(gestureState.dx) < 20;
          const nearTopEdge = gestureState.moveY < 85;
          return movingDown && mostlyVertical && nearTopEdge;
        },
        onPanResponderRelease: () => {
          showStatusBarTemporarily();
        },
      }),
    []
  );

  return (
    <View style={styles.container} {...topPullResponder.panHandlers}>
      <StatusBar style="light" backgroundColor={COLORS.primary} translucent hidden={statusBarHidden} />
      {!hideChrome && <HeaderBar onMenuPress={() => setIsMenuOpen(true)} title={title} />}
      <View style={[styles.content, { paddingBottom: hideChrome || keyboardOpen ? 0 : 58 + insets.bottom }]}>{children}</View>
      {!hideSupport && <SupportFab />}
      {!hideChrome && !keyboardOpen ? (
        <View style={[styles.tabsWrap, { paddingBottom: Math.max(insets.bottom, 8) }]}>
          <BottomTabs />
        </View>
      ) : null}

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
  tabsWrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 30,
    backgroundColor: COLORS.card,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
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
