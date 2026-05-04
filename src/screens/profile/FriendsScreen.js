import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Avatar } from '../../components/Avatar';
import { fonts } from '../../theme/fonts';
import { colors } from '../../theme/colors';
import { useFriends } from '../../hooks/useFriends';

function FriendRow({ friend, onPress }) {
  return (
    <TouchableOpacity style={s.row} activeOpacity={0.75} onPress={onPress}>
      <Avatar uri={friend.avatar_url} name={friend.full_name} size={48} style={{ borderWidth: 0 }} />
      <View style={s.rowInfo}>
        <Text style={s.rowName} numberOfLines={1}>{friend.full_name}</Text>
        <Text style={s.rowSub} numberOfLines={1}>
          {[friend.major, friend.class_year ? `Class of ${friend.class_year}` : null]
            .filter(Boolean)
            .join(' · ') || 'UW Student'}
        </Text>
      </View>
      <Feather name="chevron-right" size={18} color="rgba(255,255,255,0.4)" />
    </TouchableOpacity>
  );
}

export default function FriendsScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { friends, loading } = useFriends();

  return (
    <View style={s.root}>
      <LinearGradient colors={['#7300ff', '#00ac9b']} style={StyleSheet.absoluteFill} />

      <View style={[s.header, { paddingTop: insets.top }]}>
        <View style={s.headerInner}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
            <Feather name="arrow-left" size={20} color="#fff" />
          </TouchableOpacity>
          <Text style={s.headerTitle}>Friends</Text>
        </View>
      </View>

      {loading ? (
        <View style={s.centered}>
          <ActivityIndicator size="large" color="#fff" />
        </View>
      ) : (
        <FlatList
          data={friends}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 100 }}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={s.centered}>
              <Feather name="users" size={40} color="rgba(255,255,255,0.4)" />
              <Text style={s.emptyText}>No friends yet</Text>
            </View>
          }
          renderItem={({ item }) => (
            <FriendRow
              friend={item}
              onPress={() => navigation.navigate('UserProfile', { userId: item.id, userName: item.full_name })}
            />
          )}
          ItemSeparatorComponent={() => <View style={s.separator} />}
        />
      )}
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1 },
  header: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingBottom: 12,
  },
  headerInner: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 56,
    paddingHorizontal: 16,
    gap: 12,
  },
  backBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 22,
    fontFamily: fonts.semiBold,
    color: '#fff',
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingTop: 60,
  },
  emptyText: {
    fontSize: 15,
    fontFamily: fonts.regular,
    color: 'rgba(255,255,255,0.7)',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
  },
  rowInfo: { flex: 1 },
  rowName: {
    fontSize: 15,
    fontFamily: fonts.semiBold,
    color: colors.text,
    marginBottom: 3,
  },
  rowSub: {
    fontSize: 12,
    fontFamily: fonts.regular,
    color: colors.textSecondary,
  },
  separator: { height: 8 },
});
