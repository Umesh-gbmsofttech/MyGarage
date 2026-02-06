import React from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import MechanicCard from './MechanicCard';

const TopMechanics = ({ mechanics = [] }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Top Rated Mechanics</Text>
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
  heading: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 10,
    color: '#1F2A24',
  },
});

export default TopMechanics;
