import React from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet } from 'react-native';

type Props = {
  visible: boolean;
  title?: string;
  message: string;
  showEmoji: boolean;
  primaryLabel?: string;
  secondaryLabel?: string;
  onPrimary: () => void;
  onSecondary?: () => void;
};

export const NotificationModal: React.FC<Props> = ({
  visible,
  title,
  message,
  showEmoji,
  primaryLabel = 'Ok, entendido',
  secondaryLabel,
  onPrimary,
  onSecondary
}) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onPrimary}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Emoji thumbsdown vermelho - aparece imediatamente com o modal */}
          {showEmoji && (
            <View style={styles.emojiContainer}>
              <View style={styles.emojiGlow}>
                <Text style={styles.emoji}>👎</Text>
              </View>
            </View>
          )}
          {title ? <Text style={styles.title}>{title}</Text> : null}
          <Text style={styles.message}>{message}</Text>
          {secondaryLabel && onSecondary ? (
            <View style={styles.buttonsColumn}>
              <TouchableOpacity style={styles.button} onPress={onSecondary}>
                <Text style={styles.buttonText}>{secondaryLabel}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.button, styles.secondaryButton]} onPress={onPrimary}>
                <Text style={styles.buttonText}>{primaryLabel}</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity style={styles.button} onPress={onPrimary}>
              <Text style={styles.buttonText}>{primaryLabel}</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20
  },
  title: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 12
  },
  container: {
    backgroundColor: '#1F2937',
    borderRadius: 20,
    padding: 32,
    width: '100%',
    maxWidth: 400,
    borderWidth: 2,
    borderColor: '#EF4444'
  },
  emojiContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    width: '100%'
  },
  emojiGlow: {
    backgroundColor: 'rgba(239, 68, 68, 0.3)',
    borderRadius: 200,
    padding: 40,
    borderWidth: 4,
    borderColor: '#EF4444',
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 30,
    elevation: 20,
    width: 220,
    height: 220,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center'
  },
  emoji: {
    fontSize: 100,
    textAlign: 'center',
    lineHeight: 100,
    includeFontPadding: false,
    textAlignVertical: 'center'
  },
  message: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 32
  },
  button: {
    backgroundColor: '#EF4444',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    alignItems: 'center'
  },
  secondaryButton: {
    backgroundColor: '#374151'
  },
  buttonsColumn: {
    rowGap: 10
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    textTransform: 'uppercase'
  }
});

