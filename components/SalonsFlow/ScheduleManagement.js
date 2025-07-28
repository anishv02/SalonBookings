import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  TextInput,
  Modal,
} from "react-native";

const ScheduleManagementScreen = ({ navigation, route }) => {
  const { salonData } = route.params;

  const [schedules, setSchedules] = useState([
    // Sample data - in real app this would come from API
    {
      id: "1",
      date: "2025-06-07",
      isShopOpen: true,
      openTime: "10:00",
      closeTime: "20:00",
      seatCount: 4,
      timeRangeClosed: {
        from: "13:00",
        to: "16:00",
      },
      reason: "Staff break",
    },
    {
      id: "2",
      date: "2025-06-10",
      isShopOpen: false,
      openTime: "",
      closeTime: "",
      seatCount: 0,
      timeRangeClosed: null,
      reason: "Holiday",
    },
  ]);

  const [showAddSchedule, setShowAddSchedule] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState(null);

  const handleBackPress = () => {
    navigation.goBack();
  };

  const handleAddSchedule = () => {
    setEditingSchedule(null);
    setShowAddSchedule(true);
  };

  const handleEditSchedule = (schedule) => {
    setEditingSchedule(schedule);
    setShowAddSchedule(true);
  };

  const handleDeleteSchedule = (scheduleId) => {
    Alert.alert(
      "Delete Schedule",
      "Are you sure you want to delete this schedule?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            setSchedules((prev) => prev.filter((s) => s.id !== scheduleId));
          },
        },
      ]
    );
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const ScheduleItem = ({ schedule }) => (
    <View style={styles.scheduleItem}>
      <View style={styles.scheduleHeader}>
        <View style={styles.scheduleDateContainer}>
          <Text style={styles.scheduleDate}>{formatDate(schedule.date)}</Text>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: schedule.isShopOpen ? "#4CAF50" : "#FF5722" },
            ]}
          >
            <Text style={styles.statusText}>
              {schedule.isShopOpen ? "Open" : "Closed"}
            </Text>
          </View>
        </View>

        <View style={styles.scheduleActions}>
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => handleEditSchedule(schedule)}
          >
            <Text style={styles.editButtonText}>Edit</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => handleDeleteSchedule(schedule.id)}
          >
            <Text style={styles.deleteButtonText}>×</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.scheduleDetails}>
        {schedule.isShopOpen ? (
          <>
            <Text style={styles.detailText}>
              Hours: {schedule.openTime} - {schedule.closeTime}
            </Text>
            <Text style={styles.detailText}>Seats: {schedule.seatCount}</Text>
            {schedule.timeRangeClosed && (
              <Text style={styles.closedTimeText}>
                Closed: {schedule.timeRangeClosed.from} -{" "}
                {schedule.timeRangeClosed.to}
              </Text>
            )}
          </>
        ) : (
          <Text style={styles.closedDayText}>Salon will be closed all day</Text>
        )}

        {schedule.reason && (
          <Text style={styles.reasonText}>Reason: {schedule.reason}</Text>
        )}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
          <Text style={styles.backIcon}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Schedule Management</Text>
        <TouchableOpacity style={styles.addButton} onPress={handleAddSchedule}>
          <Text style={styles.addButtonText}>+ Add</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Info Card */}
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>📅 Schedule Overview</Text>
          <Text style={styles.infoText}>
            Manage your salon's custom schedules, off days, and special timings.
          </Text>
          <Text style={styles.infoSubText}>
            • Set custom hours for specific dates
          </Text>
          <Text style={styles.infoSubText}>• Mark complete off days</Text>
          <Text style={styles.infoSubText}>
            • Add partial closures during the day
          </Text>
        </View>

        {/* Current Schedules */}
        <View style={styles.schedulesSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Custom Schedules</Text>
            <Text style={styles.scheduleCount}>
              {schedules.length} schedules
            </Text>
          </View>

          {schedules.length > 0 ? (
            schedules.map((schedule) => (
              <ScheduleItem key={schedule.id} schedule={schedule} />
            ))
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateIcon}>📋</Text>
              <Text style={styles.emptyStateTitle}>No Custom Schedules</Text>
              <Text style={styles.emptyStateText}>
                Add custom schedules to manage off days and special timings
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Add/Edit Schedule Modal */}
      <AddEditScheduleModal
        visible={showAddSchedule}
        onClose={() => setShowAddSchedule(false)}
        editingSchedule={editingSchedule}
        salonData={salonData}
        onSave={(scheduleData) => {
          if (editingSchedule) {
            // Update existing schedule
            setSchedules((prev) =>
              prev.map((s) =>
                s.id === editingSchedule.id
                  ? { ...scheduleData, id: editingSchedule.id }
                  : s
              )
            );
          } else {
            // Add new schedule
            setSchedules((prev) => [
              ...prev,
              { ...scheduleData, id: Date.now().toString() },
            ]);
          }
          setShowAddSchedule(false);
        }}
      />
    </View>
  );
};

const AddEditScheduleModal = ({
  visible,
  onClose,
  editingSchedule,
  salonData,
  onSave,
}) => {
  const [formData, setFormData] = useState({
    date: "",
    isShopOpen: true,
    openTime: salonData?.openTime || "09:30",
    closeTime: salonData?.closeTime || "22:30",
    seatCount: salonData?.seatCount?.toString() || "1",
    hasPartialClosure: false,
    partialClosureFrom: "",
    partialClosureTo: "",
    reason: "",
  });

  const [isDateRange, setIsDateRange] = useState(false);
  const [endDate, setEndDate] = useState("");
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    if (editingSchedule) {
      setFormData({
        date: editingSchedule.date,
        isShopOpen: editingSchedule.isShopOpen,
        openTime: editingSchedule.openTime,
        closeTime: editingSchedule.closeTime,
        seatCount: editingSchedule.seatCount.toString(),
        hasPartialClosure: !!editingSchedule.timeRangeClosed,
        partialClosureFrom: editingSchedule.timeRangeClosed?.from || "",
        partialClosureTo: editingSchedule.timeRangeClosed?.to || "",
        reason: editingSchedule.reason,
      });
    } else {
      // Reset form for new schedule
      setFormData({
        date: "",
        isShopOpen: true,
        openTime: salonData?.openTime || "09:30",
        closeTime: salonData?.closeTime || "22:30",
        seatCount: salonData?.seatCount?.toString() || "1",
        hasPartialClosure: false,
        partialClosureFrom: "",
        partialClosureTo: "",
        reason: "",
      });
    }
    setIsDateRange(false);
    setEndDate("");
  }, [editingSchedule, visible, salonData]);

  const updateField = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSave = async () => {
    // Validation
    if (!formData.date) {
      Alert.alert("Error", "Please select a date");
      return;
    }

    if (formData.isShopOpen) {
      if (!formData.openTime || !formData.closeTime) {
        Alert.alert("Error", "Please enter opening and closing times");
        return;
      }
      if (!formData.seatCount || parseInt(formData.seatCount) < 0) {
        Alert.alert("Error", "Please enter a valid seat count");
        return;
      }
      if (
        formData.hasPartialClosure &&
        (!formData.partialClosureFrom || !formData.partialClosureTo)
      ) {
        Alert.alert("Error", "Please enter partial closure times");
        return;
      }
    }

    setLoading(true);

    // Prepare payload for API
    const payload = {
      shopId: salonData._id,
      date: formData.date,
      ...(isDateRange && endDate ? { endDate } : {}),
      isShopOpen: formData.isShopOpen,
      openTime: formData.isShopOpen ? formData.openTime : "",
      closeTime: formData.isShopOpen ? formData.closeTime : "",
      seatCount: formData.isShopOpen ? parseInt(formData.seatCount) : 0,
      timeRangeClosed:
        formData.isShopOpen && formData.hasPartialClosure
          ? {
              from: formData.partialClosureFrom,
              to: formData.partialClosureTo,
            }
          : null,
      reason: formData.reason,
    };

    try {
      const response = await fetch(
        "http://43.204.228.20:5000/api/availability/override",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      const result = await response.json();

      if (response.ok) {
        Alert.alert("Success", "Schedule saved successfully!");
        onSave(payload); // Update local state as well
        onClose();
      } else {
        Alert.alert("Error", result.message || "Failed to save schedule.");
      }
    } catch (error) {
      Alert.alert("Error", "Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <View style={styles.modalContainer}>
        {/* Header */}
        <View style={styles.modalHeader}>
          <TouchableOpacity style={styles.modalBackButton} onPress={onClose}>
            <Text style={styles.backIcon}>‹</Text>
          </TouchableOpacity>
          <Text style={styles.modalTitle}>
            {editingSchedule ? "Edit Schedule" : "Add Schedule"}
          </Text>
          <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
            <Text style={styles.saveButtonText}>Save</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.modalContent}
          showsVerticalScrollIndicator={true}
        >
          {/* Date Selection */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Date Selection</Text>

            {/* Date Range Toggle */}
            <View style={styles.toggleContainer}>
              <TouchableOpacity
                style={[
                  styles.toggleOption,
                  !isDateRange && styles.toggleActive,
                ]}
                onPress={() => setIsDateRange(false)}
              >
                <Text
                  style={[
                    styles.toggleText,
                    !isDateRange && styles.toggleTextActive,
                  ]}
                >
                  Single Date
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.toggleOption,
                  isDateRange && styles.toggleActive,
                ]}
                onPress={() => setIsDateRange(true)}
              >
                <Text
                  style={[
                    styles.toggleText,
                    isDateRange && styles.toggleTextActive,
                  ]}
                >
                  Date Range
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.fieldContainer}>
              <Text style={styles.fieldLabel}>
                {isDateRange ? "Start Date *" : "Date *"}
              </Text>
              <TextInput
                style={styles.input}
                value={formData.date}
                onChangeText={(value) => updateField("date", value)}
                placeholder="YYYY-MM-DD"
              />
            </View>

            {isDateRange && (
              <View style={styles.fieldContainer}>
                <Text style={styles.fieldLabel}>End Date *</Text>
                <TextInput
                  style={styles.input}
                  value={endDate}
                  onChangeText={setEndDate}
                  placeholder="YYYY-MM-DD"
                />
              </View>
            )}
          </View>

          {/* Shop Status */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Shop Status</Text>

            <View style={styles.radioContainer}>
              <TouchableOpacity
                style={styles.radioOption}
                onPress={() => updateField("isShopOpen", true)}
              >
                <View
                  style={[
                    styles.radioCircle,
                    formData.isShopOpen && styles.radioSelected,
                  ]}
                />
                <Text style={styles.radioText}>Open with custom settings</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.radioOption}
                onPress={() => updateField("isShopOpen", false)}
              >
                <View
                  style={[
                    styles.radioCircle,
                    !formData.isShopOpen && styles.radioSelected,
                  ]}
                />
                <Text style={styles.radioText}>Closed all day</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Custom Timings (only when shop is open) */}
          {formData.isShopOpen && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Custom Timings</Text>

              <View style={styles.timeRow}>
                <View style={styles.timeField}>
                  <Text style={styles.fieldLabel}>Opening Time *</Text>
                  <TextInput
                    style={styles.input}
                    value={formData.openTime}
                    onChangeText={(value) => updateField("openTime", value)}
                    placeholder="09:30"
                  />
                </View>

                <View style={styles.timeField}>
                  <Text style={styles.fieldLabel}>Closing Time *</Text>
                  <TextInput
                    style={styles.input}
                    value={formData.closeTime}
                    onChangeText={(value) => updateField("closeTime", value)}
                    placeholder="22:30"
                  />
                </View>
              </View>

              <View style={styles.fieldContainer}>
                <Text style={styles.fieldLabel}>Seat Count *</Text>
                <TextInput
                  style={styles.input}
                  value={formData.seatCount}
                  onChangeText={(value) => updateField("seatCount", value)}
                  placeholder="1"
                  keyboardType="numeric"
                />
              </View>

              {/* Partial Closure */}
              <View style={styles.partialClosureContainer}>
                <TouchableOpacity
                  style={styles.checkboxContainer}
                  onPress={() =>
                    updateField(
                      "hasPartialClosure",
                      !formData.hasPartialClosure
                    )
                  }
                >
                  <View
                    style={[
                      styles.checkbox,
                      formData.hasPartialClosure && styles.checkboxActive,
                    ]}
                  >
                    {formData.hasPartialClosure && (
                      <Text style={styles.checkmark}>✓</Text>
                    )}
                  </View>
                  <Text style={styles.checkboxLabel}>
                    Add partial closure during the day
                  </Text>
                </TouchableOpacity>

                {formData.hasPartialClosure && (
                  <View style={styles.partialClosureFields}>
                    <View style={styles.timeRow}>
                      <View style={styles.timeField}>
                        <Text style={styles.fieldLabel}>Closure Start *</Text>
                        <TextInput
                          style={styles.input}
                          value={formData.partialClosureFrom}
                          onChangeText={(value) =>
                            updateField("partialClosureFrom", value)
                          }
                          placeholder="13:00"
                        />
                      </View>

                      <View style={styles.timeField}>
                        <Text style={styles.fieldLabel}>Closure End *</Text>
                        <TextInput
                          style={styles.input}
                          value={formData.partialClosureTo}
                          onChangeText={(value) =>
                            updateField("partialClosureTo", value)
                          }
                          placeholder="16:00"
                        />
                      </View>
                    </View>
                  </View>
                )}
              </View>
            </View>
          )}

          {/* Reason */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Reason (Optional)</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={formData.reason}
              onChangeText={(value) => updateField("reason", value)}
              placeholder="Enter reason for schedule change..."
              multiline
              numberOfLines={3}
            />
          </View>

          {/* Preview */}
          <View style={styles.previewSection}>
            <Text style={styles.previewTitle}>Preview</Text>
            <View style={styles.previewCard}>
              <Text style={styles.previewDate}>
                {formData.date || "Date not selected"}
              </Text>
              {formData.isShopOpen ? (
                <>
                  <Text style={styles.previewText}>
                    Hours: {formData.openTime} - {formData.closeTime}
                  </Text>
                  <Text style={styles.previewText}>
                    Seats: {formData.seatCount}
                  </Text>
                  {formData.hasPartialClosure && (
                    <Text style={styles.previewClosure}>
                      Closed: {formData.partialClosureFrom} -{" "}
                      {formData.partialClosureTo}
                    </Text>
                  )}
                </>
              ) : (
                <Text style={styles.previewClosed}>
                  Salon will be closed all day
                </Text>
              )}
              {formData.reason && (
                <Text style={styles.previewReason}>
                  Reason: {formData.reason}
                </Text>
              )}
            </View>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
};

export default ScheduleManagementScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 15,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#f0f0f0",
    justifyContent: "center",
    alignItems: "center",
  },
  backIcon: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#333",
  },
  addButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: "#9370DB",
    borderRadius: 8,
  },
  addButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  content: {
    flex: 1,
    padding: 20,
  },
  infoCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: "#9370DB",
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#333",
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: "#666",
    marginBottom: 12,
    lineHeight: 20,
  },
  infoSubText: {
    fontSize: 12,
    color: "#888",
    marginBottom: 4,
  },
  schedulesSection: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#333",
  },
  scheduleCount: {
    fontSize: 14,
    color: "#666",
  },
  scheduleItem: {
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
  },
  scheduleHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  scheduleDateContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  scheduleDate: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginRight: 12,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    color: "#fff",
    fontWeight: "600",
  },
  scheduleActions: {
    flexDirection: "row",
    alignItems: "center",
  },
  editButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: "#f0f0f0",
    borderRadius: 6,
    marginRight: 8,
  },
  editButtonText: {
    fontSize: 12,
    color: "#9370DB",
    fontWeight: "600",
  },
  deleteButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#ff4444",
    justifyContent: "center",
    alignItems: "center",
  },
  deleteButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  scheduleDetails: {
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  detailText: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
  },
  closedTimeText: {
    fontSize: 14,
    color: "#FF5722",
    marginBottom: 4,
  },
  closedDayText: {
    fontSize: 14,
    color: "#FF5722",
    fontStyle: "italic",
    marginBottom: 4,
  },
  reasonText: {
    fontSize: 12,
    color: "#888",
    fontStyle: "italic",
    marginTop: 4,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 40,
  },
  emptyStateIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    lineHeight: 20,
  },
  // Modal Styles
  modalContainer: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 15,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  modalBackButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#f0f0f0",
    justifyContent: "center",
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#333",
  },
  saveButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: "#9370DB",
    borderRadius: 8,
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  section: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
  },
  toggleContainer: {
    flexDirection: "row",
    backgroundColor: "#f0f0f0",
    borderRadius: 8,
    padding: 4,
    marginBottom: 20,
  },
  toggleOption: {
    flex: 1,
    paddingVertical: 8,
    alignItems: "center",
    borderRadius: 6,
  },
  toggleActive: {
    backgroundColor: "#9370DB",
  },
  toggleText: {
    fontSize: 14,
    color: "#666",
    fontWeight: "500",
  },
  toggleTextActive: {
    color: "#fff",
  },
  fieldContainer: {
    marginBottom: 16,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  input: {
    fontSize: 16,
    color: "#333",
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: "#f8f9fa",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  textArea: {
    height: 80,
    textAlignVertical: "top",
  },
  radioContainer: {
    gap: 16,
  },
  radioOption: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#ccc",
  },
  radioSelected: {
    borderColor: "#9370DB",
    backgroundColor: "#9370DB",
  },
  radioText: {
    fontSize: 16,
    color: "#333",
  },
  timeRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 16,
  },
  timeField: {
    flex: 1,
  },
  partialClosureContainer: {
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  checkboxContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: "#ccc",
    marginRight: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  checkboxActive: {
    borderColor: "#9370DB",
    backgroundColor: "#9370DB",
  },
  checkmark: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
  },
  checkboxLabel: {
    fontSize: 14,
    color: "#333",
  },
  partialClosureFields: {
    paddingLeft: 32,
  },
  previewSection: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    marginBottom: 40,
  },
  previewTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 12,
  },
  previewCard: {
    backgroundColor: "#f8f9fa",
    borderRadius: 8,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: "#9370DB",
  },
  previewDate: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  previewText: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
  },
  previewClosure: {
    fontSize: 14,
    color: "#FF5722",
    marginBottom: 4,
  },
  previewClosed: {
    fontSize: 14,
    color: "#FF5722",
    fontStyle: "italic",
    marginBottom: 4,
  },
  previewReason: {
    fontSize: 12,
    color: "#888",
    fontStyle: "italic",
    marginTop: 8,
  },
});
