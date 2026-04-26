import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import uaiMedApi from '../api/uaiMedApi';

interface Professional {
  id: string;
  nome: string | null;
  especialidade: string | null;
  cidade: string | null;
  estado: string | null;
  avatar: string | null;
  totalAgendamentos?: number;
}

interface Props {
  estado?: string;
  cidade?: string;
  onPress?: (id: string) => void;
}

const AVATAR_COLORS = ['#E3F2FD', '#E8F5E9', '#FFF3E0', '#F3E5F5', '#E0F7FA', '#FCE4EC'];
const AVATAR_ICON_COLORS = ['#1E88E5', '#2E7D32', '#F57C00', '#7B1FA2', '#00838F', '#C62828'];

const FeaturedProfessionalsCarousel: React.FC<Props> = ({ estado, cidade, onPress }) => {
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let mounted = true;
    const fetch = async () => {
      setLoading(true);
      try {
        const params: Record<string, string> = {};
        if (estado) params.estado = estado;
        if (cidade) params.cidade = cidade;

        const res = await uaiMedApi.get('/medicos/recomendados', { params });
        if (mounted) setProfessionals(Array.isArray(res.data) ? res.data : []);
      } catch (e) {
        console.warn('Erro ao buscar profissionais em destaque:', e);
        if (mounted) setProfessionals([]);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetch();
    return () => { mounted = false; };
  }, [estado, cidade]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="small" color="#4CAF50" />
      </View>
    );
  }

  if (!professionals.length) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="person-outline" size={32} color="#CCC" />
        <Text style={styles.emptyText}>Nenhum profissional encontrado</Text>
      </View>
    );
  }

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.scrollContent}
    >
      {professionals.map((prof, index) => {
        const colorIndex = index % AVATAR_COLORS.length;
        const bgColor = AVATAR_COLORS[colorIndex];
        const iconColor = AVATAR_ICON_COLORS[colorIndex];
        const initials = prof.nome
          ? prof.nome.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase()
          : '?';

        return (
          <TouchableOpacity
            key={prof.id}
            style={styles.card}
            activeOpacity={0.85}
            onPress={() => onPress?.(prof.id)}
          >
            {/* Avatar */}
            <View style={[styles.avatarContainer, { backgroundColor: bgColor }]}>
              {prof.avatar ? (
                <Image source={{ uri: prof.avatar }} style={styles.avatarImage} />
              ) : (
                <Text style={[styles.avatarInitials, { color: iconColor }]}>{initials}</Text>
              )}
            </View>

            {/* Info */}
            <View style={styles.infoContainer}>
              <Text style={styles.name} numberOfLines={1}>
                {prof.nome || 'Profissional'}
              </Text>

              {prof.especialidade ? (
                <View style={styles.badgeRow}>
                  <View style={[styles.badge, { backgroundColor: bgColor }]}>
                    <Text style={[styles.badgeText, { color: iconColor }]} numberOfLines={1}>
                      {prof.especialidade}
                    </Text>
                  </View>
                </View>
              ) : null}

              {(prof.cidade || prof.estado) ? (
                <View style={styles.locationRow}>
                  <Ionicons name="location-outline" size={12} color="#999" style={{ marginRight: 3 }} />
                  <Text style={styles.locationText} numberOfLines={1}>
                    {[prof.cidade, prof.estado].filter(Boolean).join(', ')}
                  </Text>
                </View>
              ) : null}
            </View>

            {/* Seta */}
            <View style={styles.arrowContainer}>
              <Ionicons name="chevron-forward" size={16} color="#CCC" />
            </View>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContent: {
    paddingLeft: 4,
    paddingRight: 12,
    paddingBottom: 8,
    gap: 10,
  },
  loadingContainer: {
    height: 96,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    height: 96,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  emptyText: {
    fontSize: 13,
    color: '#BBB',
  },
  card: {
    width: 240,
    backgroundColor: '#FFF',
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  avatarContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    flexShrink: 0,
  },
  avatarImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  avatarInitials: {
    fontSize: 17,
    fontWeight: '700',
  },
  infoContainer: {
    flex: 1,
    gap: 4,
  },
  name: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  badgeRow: {
    flexDirection: 'row',
  },
  badge: {
    borderRadius: 6,
    paddingHorizontal: 7,
    paddingVertical: 3,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationText: {
    fontSize: 12,
    color: '#999',
    flex: 1,
  },
  arrowContainer: {
    marginLeft: 4,
  },
});

export default FeaturedProfessionalsCarousel;