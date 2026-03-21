'use client';
import React from 'react';
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
} from '@react-pdf/renderer';

Font.register({
  family: 'Helvetica',
  fonts: [
    { src: 'https://fonts.gstatic.com/s/roboto/v30/KFOmCnqEu92Fr1Mu4mxP.ttf' },
  ],
});

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: 'Helvetica',
    fontSize: 11,
    lineHeight: 1.5,
  },
  header: {
    marginBottom: 30,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 12,
    color: '#666',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    paddingBottom: 4,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  label: {
    color: '#666',
  },
  value: {
    fontWeight: 'normal',
  },
  table: {
    marginTop: 10,
    marginBottom: 10,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f5f5f5',
    padding: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  tableRow: {
    flexDirection: 'row',
    padding: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  col1: { width: '50%' },
  col2: { width: '30%' },
  col3: { width: '20%', textAlign: 'right' },
  tableHeaderText: {
    fontWeight: 'bold',
    fontSize: 10,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 2,
    borderTopColor: '#333',
  },
  totalLabel: {
    fontWeight: 'bold',
    fontSize: 12,
    marginRight: 10,
  },
  totalValue: {
    fontWeight: 'bold',
    fontSize: 12,
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    textAlign: 'center',
    fontSize: 9,
    color: '#999',
  },
});

interface Task {
  title: string;
  description?: string;
  price?: number;
  estimatedHours?: number;
}

interface Client {
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  company?: string;
}

interface ProjectData {
  name: string;
  type: string;
  description?: string;
  client: Client;
  tasks: Task[];
}

interface AgreementDocumentProps {
  project: ProjectData;
  agreementType: string;
  generatedDate: string;
}

export function AgreementDocument({
  project,
  agreementType,
  generatedDate,
}: AgreementDocumentProps) {
  const totalPrice = project.tasks.reduce((sum, t) => sum + (t.price || 0), 0);
  const totalHours = project.tasks.reduce(
    (sum, t) => sum + (t.estimatedHours || 0),
    0
  );

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'PROJECT':
        return 'Projekt';
      case 'SUPPORT':
        return 'Support';
      case 'RETAINER':
        return 'Retainer';
      default:
        return type;
    }
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>Aftale</Text>
          <Text style={styles.subtitle}>
            {getTypeLabel(agreementType)} - {generatedDate}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Kundeoplysninger</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Navn:</Text>
            <Text style={styles.value}>{project.client.name}</Text>
          </View>
          {project.client.company && (
            <View style={styles.row}>
              <Text style={styles.label}>Virksomhed:</Text>
              <Text style={styles.value}>{project.client.company}</Text>
            </View>
          )}
          {project.client.email && (
            <View style={styles.row}>
              <Text style={styles.label}>E-mail:</Text>
              <Text style={styles.value}>{project.client.email}</Text>
            </View>
          )}
          {project.client.phone && (
            <View style={styles.row}>
              <Text style={styles.label}>Telefon:</Text>
              <Text style={styles.value}>{project.client.phone}</Text>
            </View>
          )}
          {project.client.address && (
            <View style={styles.row}>
              <Text style={styles.label}>Adresse:</Text>
              <Text style={styles.value}>{project.client.address}</Text>
            </View>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Projekt</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Projektnavn:</Text>
            <Text style={styles.value}>{project.name}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Type:</Text>
            <Text style={styles.value}>{getTypeLabel(project.type)}</Text>
          </View>
          {project.description && (
            <View style={styles.row}>
              <Text style={styles.label}>Beskrivelse:</Text>
              <Text style={styles.value}>{project.description}</Text>
            </View>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Opgaver og priser</Text>
          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={[styles.col1, styles.tableHeaderText]}>Opgave</Text>
              <Text style={[styles.col2, styles.tableHeaderText]}>Timer</Text>
              <Text style={[styles.col3, styles.tableHeaderText]}>Pris</Text>
            </View>
            {project.tasks.map((task, index) => (
              <View key={index} style={styles.tableRow}>
                <View style={styles.col1}>
                  <Text>{task.title}</Text>
                  {task.description && (
                    <Text style={{ fontSize: 9, color: '#666' }}>
                      {task.description}
                    </Text>
                  )}
                </View>
                <Text style={styles.col2}>
                  {task.estimatedHours ? `${task.estimatedHours} t.` : '-'}
                </Text>
                <Text style={styles.col3}>
                  {task.price ? `${task.price.toLocaleString('da-DK')} kr.` : '-'}
                </Text>
              </View>
            ))}
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>I alt:</Text>
            <Text style={styles.totalValue}>
              {totalPrice.toLocaleString('da-DK')} kr. ({totalHours} timer)
            </Text>
          </View>
        </View>

        <View style={styles.footer}>
          <Text>
            Denne aftale er genereret automatisk af Acordio
          </Text>
        </View>
      </Page>
    </Document>
  );
}
