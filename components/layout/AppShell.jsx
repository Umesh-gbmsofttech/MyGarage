import React, { useState } from 'react';
import { Dimensions, StyleSheet, TouchableWithoutFeedback, View } from 'react-native';
import HeaderBar from './HeaderBar';
import SidebarMenu from './SidebarMenu';
import SupportFab from '../utility/SupportFab';

const AppShell = ({ children, hideChrome = false, hideSupport = false, title }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <View style={styles.container}>
      {!hideChrome && <HeaderBar onMenuPress={() => setIsMenuOpen(true)} title={title} />}
      <View style={styles.content}>{children}</View>
      {!hideSupport && <SupportFab />}

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
    backgroundColor: '#F8F6F0',
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
