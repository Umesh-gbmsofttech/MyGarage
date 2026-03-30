import React from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

const KeyboardScreen = ({
  children,
  containerStyle,
  contentContainerStyle,
  keyboardVerticalOffset = 88,
  extraScrollHeight = 28,
  ...scrollProps
}) => {
  return (
    <KeyboardAvoidingView
      style={[styles.flex, containerStyle]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={keyboardVerticalOffset}
    >
      <KeyboardAwareScrollView
        style={styles.flex}
        contentContainerStyle={[styles.content, contentContainerStyle]}
        keyboardShouldPersistTaps="handled"
        enableOnAndroid
        extraScrollHeight={extraScrollHeight}
        showsVerticalScrollIndicator={false}
        {...scrollProps}
      >
        {children}
      </KeyboardAwareScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { flexGrow: 1 },
});

export default KeyboardScreen;
