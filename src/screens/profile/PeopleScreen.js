import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Avatar } from '../../components/Avatar';
import { fonts } from '../../theme/fonts';
import { colors } from '../../theme/colors';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { useFriends } from '../../hooks/useFriends';

function FriendButton({ friendship, onAdd, onAccept, onRemove }) {
  if (friendship?.status === 'accepted') {
    return (
      <TouchableOpacity style={[s.friendBtn, { backgroundColor: colors.teal }]} onPress={onRemove}>
        <Feather name="user-check" size={14} color="#fff" />
        <Text style={s.friendBtnText}>Friends</Text>
      </TouchableOpacity>
    );
  }
  if (friendship?.status === 'pending' && friendship?.direction === 'outgoing') {
    return (
      <TouchableOpacity style={[s.friendBtn, { backgroundColor: colors.amber, opacity: 0.8 }]} disabled>
        <Feather name="clock" size={14} color="#fff" />
        <Text style={s.friendBtnText}>Requested</Text>
      </TouchableOpacity>
    );
  }
  if (friendship?.status === 'pending' && friendship?.direction === 'incoming') {
    return (
      <TouchableOpacity style={[s.friendBtn, { backgroundColor: colors.teal }]} onPress={onAccept}>
        <Feather name="user-plus" size={14} color="#fff" />
        <Text style={s.friendBtnText}>Accept</Text>
      </TouchableOpacity>
    );
  }
  return (
    <TouchableOpacity style={[s.friendBtn, { backgroundColor: colors.primary }]} onPress={onAdd}>
      <Feather name="user-plus" size={14} color="#fff" />
      <Text style={s.friendBtnText}>Add</Text>
    </TouchableOpacity>
  );
}

function PersonRow({ person, onPress, friendship, onAdd, onAccept, onRemove }) {
  return (
    <TouchableOpacity style={s.row} activeOpacity={0.75} onPress={onPress}>
      <Avatar uri={person.avatar_url} name={person.full_name} size={48} style={{ borderWidth: 0 }} />
      <View style={s.rowInfo}>
        <Text style={s.rowName} numberOfLines={1}>{person.full_name}</Text>
        <Text style={s.rowSub} numberOfLines={1}>
          {[person.major, person.class_year ? `Class of ${person.class_year}` : null]
            .filter(Boolean)
            .join(' · ') || 'UW Student'}
        </Text>
      </View>
      <FriendButton
        friendship={friendship}
        onAdd={onAdd}
        onAccept={onAccept}
        onRemove={onRemove}
      />
    </TouchableOpacity>
  );
}

export default function PeopleScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { sendRequest, acceptRequest, removeFriend, getFriendship, refresh } = useFriends();
  const [query, setQuery] = useState('');
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from('profiles')
      .select('id, full_name, avatar_url, major, class_year')
      .neq('id', user.id)
      .order('full_name');
    setAllUsers(data || []);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const filtered = query.trim()
    ? allUsers.filter((u) =>
        u.full_name?.toLowerCase().includes(query.toLowerCase())
      )
    : allUsers;

  const handleRemove = (person) => {
    Alert.alert(
      'Remove Friend',
      `Remove ${person.full_name.split(' ')[0]} as a friend?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Remove', style: 'destructive', onPress: () => { removeFriend(person.id); refresh(); } },
      ]
    );
  };

  return (
    <View style={s.root}>
      <LinearGradient colors={['#7300ff', '#00ac9b']} style={StyleSheet.absoluteFill} />

      {/* Header */}
      <View style={[s.header, { paddingTop: insets.top }]}>
        <View style={s.headerInner}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
            <Feather name="arrow-left" size={20} color="#fff" />
          </TouchableOpacity>
          <Text style={s.headerTitle}>Find People</Text>
        </View>

        {/* Search bar */}
        <View style={s.searchWrap}>
          <Feather name="search" size={16} color="rgba(255,255,255,0.6)" />
          <TextInput
            style={s.searchInput}
            value={query}
            onChangeText={setQuery}
            placeholder="Search by name..."
            placeholderTextColor="rgba(255,255,255,0.5)"
            autoCorrect={false}
            autoCapitalize="none"
            returnKeyType="search"
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery('')}>
              <Feather name="x" size={16} color="rgba(255,255,255,0.6)" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {loading ? (
        <View style={s.centered}>
          <ActivityIndicator size="large" color="#fff" />
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 100 }}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={s.centered}>
              <Feather name="users" size={40} color="rgba(255,255,255,0.4)" />
              <Text style={s.emptyText}>
                {query ? 'No users found' : 'No other users yet'}
              </Text>
            </View>
          }
          renderItem={({ item }) => {
            const friendship = getFriendship(item.id);
            return (
              <PersonRow
                person={item}
                friendship={friendship}
                onPress={() => navigation.navigate('UserProfile', { userId: item.id })}
                onAdd={() => { sendRequest(item.id); refresh(); }}
                onAccept={() => { acceptRequest(item.id); refresh(); }}
                onRemove={() => handleRemove(item)}
              />
            );
          }}
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

  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginHorizontal: 16,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    fontFamily: fonts.regular,
    color: '#fff',
    paddingVertical: 0,
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

  friendBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
  },
  friendBtnText: {
    fontSize: 13,
    fontFamily: fonts.semiBold,
    color: '#fff',
  },

  separator: { height: 8 },
});
