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

interface Clinic {
  id: string;
  nome: string | null;
  avatar: string | null;
  localizacao: string | null;
  nota?: number;
}

interface Props {
  estado?: string;
  cidade?: string;
  onPress?: (id: string) => void;
}

const AVATAR_COLORS = ['#E8EAF6', '#E0F2F1', '#FFF8E1', '#FCE4EC', '#E8F5E9', '#E3F2FD'];
const AVATAR_ICON_COLORS = ['#3949AB', '#00695C', '#F9A825', '#AD1457', '#2E7D32', '#1565C0'];

const FeaturedClinicsCarousel: React.FC<Props> = ({ estado, cidade, onPress }) => {
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let mounted = true;
    const fetch = async () => {
      setLoading(true);
      try {
        const params: Record<string, string> = {};
        if (estado) params.estado = estado;
        if (cidade) params.cidade = cidade;

        const res = await uaiMedApi.get('/clinicas/recomendadas', { params });
        if (mounted) setClinics(Array.isArray(res.data) ? res.data : []);
      } catch (e) {
        console.warn('Erro ao buscar clínicas em destaque:', e);
        if (mounted) setClinics([]);
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

  if (!clinics.length) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="business-outline" size={32} color="#CCC" />
        <Text style={styles.emptyText}>Nenhuma clínica encontrada</Text>
      </View>
    );
  }

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.scrollContent}
    >
      {clinics.map((clinic, index) => {
        const colorIndex = index % AVATAR_COLORS.length;
        const bgColor = AVATAR_COLORS[colorIndex];
        const iconColor = AVATAR_ICON_COLORS[colorIndex];
        const initials = clinic.nome
          ? clinic.nome.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase()
          : '?';

        return (
          <TouchableOpacity
            key={clinic.id}
            style={styles.card}
            activeOpacity={0.85}
            onPress={() => onPress?.(clinic.id)}
          >
            {/* Avatar / Logo */}
            <View style={[styles.avatarContainer, { backgroundColor: bgColor }]}>
              {clinic.avatar ? (
                <Image source={{ uri: clinic.avatar }} style={styles.avatarImage} />
              ) : (
                <Text style={[styles.avatarInitials, { color: iconColor }]}>{initials}</Text>
              )}
            </View>

            {/* Info */}
            <View style={styles.infoContainer}>
              <Text style={styles.name} numberOfLines={1}>
                {clinic.nome || 'Clínica'}
              </Text>

              {/* Badge "Clínica" */}
              <View style={styles.badgeRow}>
                <View style={[styles.badge, { backgroundColor: bgColor }]}>
                  <Text style={[styles.badgeText, { color: iconColor }]}>Clínica</Text>
                </View>
              </View>

              {/* Localização */}
              {clinic.localizacao ? (
                <View style={styles.locationRow}>
                  <Ionicons name="location-outline" size={12} color="#999" style={{ marginRight: 3 }} />
                  <Text style={styles.locationText} numberOfLines={1}>
                    {clinic.localizacao}
                  </Text>
                </View>
              ) : null}

              {/* Nota */}
              {clinic.nota != null ? (
                <View style={styles.ratingRow}>
                  <Ionicons name="star" size={11} color="#FFC107" style={{ marginRight: 3 }} />
                  <Text style={styles.ratingText}>{clinic.nota.toFixed(1)}</Text>
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
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 12,
    color: '#888',
    fontWeight: '600',
  },
  arrowContainer: {
    marginLeft: 4,
  },
});

export default FeaturedClinicsCarousel;