import { Text } from 'react-native-paper';
import { StyleSheet, View } from 'react-native';

export function Updates() {
  return (
    <View style={styles.container}>
      <Text>Updates Screen</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
  },
});
