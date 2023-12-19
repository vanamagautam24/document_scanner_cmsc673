import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { RecentFile } from '../types/types';

interface RecentFilesListProps {
  recentFiles: RecentFile[]; // Specify the prop type as an array of RecentFile
}


const RecentFileItem = ({ title, timestamp, thumbnail }: RecentFile) => {
  return (
    <View style={styles.fileContainer}>
      <Image source={thumbnail} style={styles.thumbnail} />
      <View style={styles.fileDetails}>
        {/* Title at the top */}
        <Text style={styles.fileTitle} numberOfLines={2}>
          {title}
        </Text>
        {/* Add space between title and timestamp */}
        <View style={styles.space} />
        {/* Timestamp at the bottom */}
        <Text style={styles.fileTimestamp}>{timestamp}</Text>
      </View>
      <TouchableOpacity style={styles.shareIcon}>
        <Ionicons name="share-social" size={20} color="#000" />
      </TouchableOpacity>
      <TouchableOpacity style={styles.moreIcon}>
        <Ionicons name="ellipsis-vertical" size={20} color="#000" />
      </TouchableOpacity>
    </View>
  );
};

const RecentFilesList: React.FC<RecentFilesListProps> = ({ recentFiles }) => {
  return (
    <View style={styles.recentFilesContainer}>
      
      {recentFiles.map((file) => (
        <RecentFileItem
          key={file.id}
          title={file.title}
          timestamp={file.timestamp}
          thumbnail={file.thumbnail}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  recentFilesContainer: {

  },

  fileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(240, 240, 240, 0.6)', 
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
  },
  thumbnail: {
    width: 120,
    height: 120,
    borderRadius: 5,
    marginRight: 10,
  },
  fileDetails: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  fileTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    height: 40, // Fixed height for title
  },
  fileTimestamp: {
    fontSize: 14,
    color: '#666',
    height: 20, // Fixed height for timestamp
  },
  shareIcon: {
    marginRight: 10, // Add margin to separate from the title
  },
  space: {
    height: 30, // Add space between title and timestamp
  },
  moreIcon: {},
});

export default RecentFilesList;
