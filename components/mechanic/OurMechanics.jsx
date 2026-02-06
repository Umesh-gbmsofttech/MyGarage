import React from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import MechanicCard from './MechanicCard';

const OurMechanics = ({ mechanics = [] }) => {
  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.heading}>Available Mechanics</Text>
      </View>
      <FlatList
        horizontal
        data={mechanics}
        renderItem={({ item }) => <MechanicCard mechanic={item} />}
        keyExtractor={(item) => String(item.mechanicId)}
        showsHorizontalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 18,
    paddingHorizontal: 18,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  heading: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2A24',
  },
});

export default OurMechanics;
