import { OfferBottomSheet } from '../components/OfferBottomSheet';

// ... (existing imports, but make sure to remove unused ones if any)

export const DropDetailScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<DropDetailRouteProp>();
  const { dropId } = route.params;

  const [drop, setDrop] = useState<DropDetail | null>(null);
  const [templates, setTemplates] = useState<DropTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Sheet State
  const [showOfferSheet, setShowOfferSheet] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<DropTemplate | null>(null);

  useEffect(() => {
    // ... (existing fetch logic)
    const fetchDropDetails = async () => {
      setLoading(true);
      try {
        // Fetch Drop Info
        const { data: dropData, error: dropError } = await supabase
          .from('creator_drops')
          .select('id, city, creator_id, rules, creator:users!creator_id(full_name, avatar_url)')
          .eq('id', dropId)
          .single();

        if (dropError) throw dropError;
        setDrop(dropData as any);

        // Fetch Templates
        const { data: tmplData, error: tmplError } = await supabase
          .from('drop_moment_templates')
          .select('*')
          .eq('drop_id', dropId);
        
        if (tmplError) throw tmplError;
        setTemplates(tmplData || []);

      } catch (error) {
        logger.error('Failed to fetch drop details:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDropDetails();
  }, [dropId]);

  const handleTemplateSelect = (template: DropTemplate) => {
    setSelectedTemplate(template);
    setShowOfferSheet(true);
  };

  // ... (loading and error states)
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.brand.primary} />
      </View>
    );
  }

  if (!drop) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.errorText}>Drop not found</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <MaterialCommunityIcons name="close" size={24} color={COLORS.text.primary} />
        </TouchableOpacity>
        <Text style={styles.cityText}>{drop.city} Drop</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.creatorTitle}>{drop.creator?.full_name} is hosting</Text>
        <Text style={styles.subtitle}>Select an experience to send an offer</Text>

        <View style={styles.templatesList}>
          {templates.map((template) => (
             <TouchableOpacity 
               key={template.id} 
               style={styles.templateCard}
               onPress={() => handleTemplateSelect(template)}
             >
               <View style={styles.templateHeader}>
                  <Text style={styles.templateTitle}>{template.title}</Text>
                  <MaterialCommunityIcons name="chevron-right" size={24} color={COLORS.text.secondary} />
               </View>
               <Text style={styles.templateDesc}>{template.description}</Text>
               {template.min_tier > 0 && (
                 <View style={styles.tierBadge}>
                   <Text style={styles.tierText}>Min Tier {template.min_tier}</Text>
                 </View>
               )}
             </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* Offer Sheet */}
      <OfferBottomSheet 
        visible={showOfferSheet}
        onClose={() => setShowOfferSheet(false)}
        dropId={drop.id}
        receiverId={(drop as any).creator_id || ''}
        templateId={selectedTemplate?.id}
        minTier={selectedTemplate?.min_tier}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg.primary,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  backButton: {
    marginRight: 16,
  },
  cityText: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text.primary,
  },
  errorText: {
    textAlign: 'center',
    marginTop: 20,
    color: COLORS.text.secondary,
  },
  content: {
    padding: 20,
  },
  creatorTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.text.primary,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.text.secondary,
    marginBottom: 24,
  },
  templatesList: {
    gap: 16,
  },
  templateCard: {
    backgroundColor: COLORS.bg.secondary,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: COLORS.border.subtle,
  },
  templateHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  templateTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text.primary,
  },
  templateDesc: {
    fontSize: 14,
    color: COLORS.text.secondary,
    lineHeight: 20,
  },
  tierBadge: {
    alignSelf: 'flex-start',
    backgroundColor: COLORS.brand.secondary + '20',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginTop: 12,
  },
  tierText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.brand.secondary,
  },
});
